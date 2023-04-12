import '@logseq/libs'
import {
  BlockEntity,
  IBatchBlock,
  LSPluginBaseInfo,
} from '@logseq/libs/dist/LSPlugin'
import { DateTime } from 'luxon'
import {
  Article,
  DeletedArticle,
  HighlightType,
  PageType,
  getDeletedOmnivoreArticles,
  getOmnivoreArticles,
} from './api'
import {
  HighlightOrder,
  Settings,
  getQueryFromFilter,
  settingsSchema,
} from './settings'
import {
  renderArticleContent,
  renderHighlightContent,
} from './settings/template'
import {
  DATE_FORMAT,
  compareHighlightsInFile,
  delay,
  escapeQuotationMarks,
  getHighlightLocation,
  parseDateTime,
} from './util'

const isValidCurrentGraph = async (): Promise<boolean> => {
  const settings = logseq.settings as Settings
  const currentGraph = await logseq.App.getCurrentGraph()

  return currentGraph?.name === settings.graph
}

const deleteBlocks = async (blocks: BlockEntity[]) => {
  for await (const block of blocks) {
    await logseq.Editor.removeBlock(block.uuid)
  }
}

const startSyncJob = () => {
  const settings = logseq.settings as Settings
  // sync every frequency minutes
  if (settings.frequency > 0) {
    const intervalId = setInterval(
      async () => {
        if (await isValidCurrentGraph()) {
          await fetchOmnivore(true)
        }
      },
      settings.frequency * 1000 * 60,
      settings.syncAt
    )
    logseq.updateSettings({ syncJobId: intervalId })
  }
}

const resetLoadingState = () => {
  console.log('reset loading state')
  const settings = logseq.settings as Settings
  settings.loading && logseq.updateSettings({ loading: false })
}

const resetSyncJob = () => {
  console.log('reset sync job')
  const settings = logseq.settings as Settings
  settings.syncJobId > 0 && clearInterval(settings.syncJobId)
  logseq.updateSettings({ syncJobId: 0 })
}

const resetState = () => {
  resetLoadingState()
  resetSyncJob()
}

const fetchOmnivore = async (inBackground = false) => {
  const {
    syncAt,
    apiKey,
    filter,
    customQuery,
    highlightOrder,
    pageName,
    articleTemplate,
    highlightTemplate,
    graph,
    loading,
    endpoint,
  } = logseq.settings as Settings
  // prevent multiple fetches
  if (loading) {
    await logseq.UI.showMsg('Omnivore is already syncing', 'warning', {
      timeout: 3000,
    })
    return
  }
  logseq.updateSettings({ loading: true })

  if (!apiKey) {
    await logseq.UI.showMsg('Missing Omnivore api key', 'warning', {
      timeout: 3000,
    }).then(() => {
      logseq.showSettingsUI()
      setTimeout(async function () {
        await logseq.App.openExternalLink('https://omnivore.app/settings/api')
      }, 3000)
    })
    return
  }

  if (!(await isValidCurrentGraph())) {
    await logseq.UI.showMsg(
      `Omnivore is configured to sync into your "${graph}" graph which is not currently active.\nPlease switch to graph "${graph}" to sync Omnivore articles.`,
      'error'
    )

    return
  }

  const blockTitle = '## 🔖 Articles'
  const fetchingTitle = '🚀 Fetching articles ...'

  !inBackground && logseq.App.pushState('page', { name: pageName })

  await delay(300)

  let targetBlock: BlockEntity | null = null
  const userConfigs = await logseq.App.getUserConfigs()
  const preferredDateFormat: string = userConfigs.preferredDateFormat
  const fetchingMsgKey = 'omnivore-fetching'

  try {
    console.log(`logseq-omnivore starting sync since: '${syncAt}`)
    !inBackground &&
      (await logseq.UI.showMsg(fetchingTitle, 'success', {
        key: fetchingMsgKey,
      }))

    let omnivorePage = await logseq.Editor.getPage(pageName)
    if (!omnivorePage) {
      omnivorePage = await logseq.Editor.createPage(pageName)
    }
    if (!omnivorePage) {
      throw new Error('Failed to create page')
    }

    const pageBlocksTree = await logseq.Editor.getPageBlocksTree(pageName)
    targetBlock = pageBlocksTree.length > 0 ? pageBlocksTree[0] : null
    if (targetBlock) {
      await logseq.Editor.updateBlock(targetBlock.uuid, fetchingTitle)
    } else {
      targetBlock = await logseq.Editor.appendBlockInPage(
        pageName,
        fetchingTitle
      )
    }
    if (!targetBlock) {
      throw new Error('block error')
    }

    const size = 50
    for (
      let hasNextPage = true, articles: Article[] = [], after = 0;
      hasNextPage;
      after += size
    ) {
      ;[articles, hasNextPage] = await getOmnivoreArticles(
        apiKey,
        after,
        size,
        parseDateTime(syncAt).toISO(),
        getQueryFromFilter(filter, customQuery),
        true,
        'markdown',
        endpoint
      )
      const articleBatch: IBatchBlock[] = []
      for (const article of articles) {
        // filter out notes and redactions
        const highlights = article.highlights?.filter(
          (h) => h.type === HighlightType.Highlight
        )
        // sort highlights by location if selected in options
        if (highlightOrder === HighlightOrder.LOCATION) {
          highlights?.sort((a, b) => {
            try {
              // sort by highlight position percent if available
              if (
                a.highlightPositionPercent !== undefined &&
                b.highlightPositionPercent !== undefined
              ) {
                return a.highlightPositionPercent - b.highlightPositionPercent
              }
              if (article.pageType === PageType.File) {
                // sort by location in file
                return compareHighlightsInFile(a, b)
              }
              // for web page, sort by location in the page
              return (
                getHighlightLocation(a.patch) - getHighlightLocation(b.patch)
              )
            } catch (e) {
              console.error(e)
              return compareHighlightsInFile(a, b)
            }
          })
        }
        const highlightBatch: IBatchBlock[] =
          highlights?.map((it) => {
            // Build content string based on template
            const content = renderHighlightContent(
              highlightTemplate,
              it,
              article,
              preferredDateFormat
            )
            const noteChild = it.annotation
              ? { content: it.annotation }
              : undefined
            return {
              content,
              children: noteChild ? [noteChild] : undefined,
              properties: {
                id: it.id,
              },
            }
          }) || []

        let isNewArticle = true
        // update existing block if article is already in the page
        const existingBlocks = (
          await logseq.DB.datascriptQuery<BlockEntity[]>(
            `[:find (pull ?b [*])
                    :where
                      [?b :block/page ?p]
                      [?p :block/original-name "${pageName}"]
                      [?b :block/parent ?parent]
                      [?parent :block/uuid ?u]
                      [(str ?u) ?s]
                      [(= ?s "${targetBlock.uuid}")]
                      [?b :block/content ?c]
                      [(clojure.string/includes? ?c "${article.slug}")]]`
          )
        ).flat()
        const articleContent = renderArticleContent(
          articleTemplate,
          article,
          preferredDateFormat
        )
        if (existingBlocks.length > 0) {
          isNewArticle = false
          const existingBlock = existingBlocks[0]
          // update the first existing block
          if (existingBlock.content !== articleContent) {
            await logseq.Editor.updateBlock(existingBlock.uuid, articleContent)
          }
          // delete the rest of the existing blocks
          await deleteBlocks(existingBlocks.slice(1))
          // append highlights to existing block
          for (const highlight of highlightBatch) {
            const existingHighlights = (
              await logseq.DB.datascriptQuery<BlockEntity[]>(
                `[:find (pull ?b [*])
                          :where
                            [?b :block/parent ?p]
                            [?p :block/uuid ?u]
                            [(str ?u) ?s]
                            [(= ?s "${existingBlock.uuid}")]
                            [?b :block/content ?c]
                            [(clojure.string/includes? ?c "${
                              highlight.properties?.id as string
                            }")]]`
              )
            ).flat()
            if (existingHighlights.length > 0) {
              const existingHighlight = existingHighlights[0]
              // update existing highlight if content is different
              existingHighlight.content !== highlight.content &&
                (await logseq.Editor.updateBlock(
                  existingHighlight.uuid,
                  highlight.content
                ))

              // checking notes
              const noteChild = highlight.children?.[0]
              if (noteChild) {
                const existingNotes = (
                  await logseq.DB.datascriptQuery<BlockEntity[]>(
                    `[:find (pull ?b [*])
                              :where
                                [?b :block/parent ?p]
                                [?p :block/uuid ?u]
                                [(str ?u) ?s]
                                [(= ?s "${existingHighlight.uuid}")]
                                [?b :block/content ?c]
                                [(= ?c "${escapeQuotationMarks(
                                  noteChild.content
                                )}")]]`
                  )
                ).flat()
                if (existingNotes.length == 0) {
                  // append new note
                  await logseq.Editor.insertBlock(
                    existingHighlight.uuid,
                    noteChild.content,
                    { sibling: false }
                  )
                }
              }
            } else {
              // append new highlight
              await logseq.Editor.insertBatchBlock(
                existingBlock.uuid,
                highlight,
                { sibling: false }
              )
            }
          }
        }

        isNewArticle &&
          articleBatch.unshift({
            content: articleContent,
            children: highlightBatch,
          })
      }

      articleBatch.length > 0 &&
        (await logseq.Editor.insertBatchBlock(targetBlock.uuid, articleBatch, {
          before: true,
          sibling: false,
        }))
    }

    // delete blocks where article has been deleted
    for (
      let hasNextPage = true, deletedArticles: DeletedArticle[] = [], after = 0;
      hasNextPage;
      after += size
    ) {
      ;[deletedArticles, hasNextPage] = await getDeletedOmnivoreArticles(
        apiKey,
        after,
        size,
        parseDateTime(syncAt).toISO(),
        endpoint
      )

      for (const deletedArticle of deletedArticles) {
        const slug = deletedArticle.node.slug
        const existingBlocks = (
          await logseq.DB.datascriptQuery<BlockEntity[]>(
            `[:find (pull ?b [*])
                    :where
                      [?b :block/page ?p]
                      [?p :block/original-name "${pageName}"]
                      [?b :block/parent ?parent]
                      [?parent :block/uuid ?u]
                      [(str ?u) ?s]
                      [(= ?s "${targetBlock.uuid}")]
                      [?b :block/content ?c]
                      [(clojure.string/includes? ?c "${slug}")]]`
          )
        ).flat()

        if (existingBlocks.length > 0) {
          await deleteBlocks(existingBlocks)
        }
      }
    }

    if (!inBackground) {
      logseq.UI.closeMsg(fetchingMsgKey)
      await logseq.UI.showMsg('🔖 Articles fetched', 'success', {
        timeout: 2000,
      })
    }
    logseq.updateSettings({ syncAt: DateTime.local().toFormat(DATE_FORMAT) })
  } catch (e) {
    !inBackground &&
      (await logseq.UI.showMsg('Failed to fetch articles', 'error'))
    console.error(e)
  } finally {
    resetLoadingState()
    targetBlock &&
      (await logseq.Editor.updateBlock(targetBlock.uuid, blockTitle))
  }
}

/**
 * main entry
 * @param baseInfo
 */
const main = async (baseInfo: LSPluginBaseInfo) => {
  console.log('logseq-omnivore loaded')

  logseq.useSettingsSchema(await settingsSchema())

  logseq.onSettingsChanged((newSettings: Settings, oldSettings: Settings) => {
    const newFrequency = newSettings.frequency
    if (newFrequency !== oldSettings.frequency) {
      // remove existing scheduled task and create new one
      oldSettings.syncJobId > 0 && clearInterval(oldSettings.syncJobId)
      logseq.updateSettings({ syncJobId: 0 })
      newFrequency > 0 && startSyncJob()
    }
  })

  logseq.provideModel({
    async loadOmnivore() {
      await fetchOmnivore()
    },
  })

  logseq.App.registerUIItem('toolbar', {
    key: 'logseq-omnivore',
    template: `
      <a data-on-click="loadOmnivore" class="button">
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_3843_101374)">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M14.9932 0.0384085C24.2849 -0.580762 32.0905 6.35808 32.2144 15.6498C32.2144 16.6404 31.9667 17.8788 31.719 18.9933C31.0999 21.7176 28.6232 23.5752 25.8947 23.5752H25.7709C22.4273 23.5752 20.1942 20.727 20.1942 17.627V14.1596L18.2129 17.1316L18.089 17.2555C16.9745 18.2462 15.3647 18.2462 14.2502 17.2555L14.0025 17.1316L11.8973 14.0358V22.0891H9.04913V12.426C9.04913 10.4446 11.402 9.20626 13.0118 10.6923L13.1357 10.8161L15.9838 15.0265L18.9559 10.9399L19.0797 10.8161C20.5657 9.57777 23.0424 10.5684 23.0424 12.6736V17.6311C23.0424 19.4886 24.1569 20.727 25.7667 20.727H25.8906C27.3766 20.727 28.6149 19.7363 28.9864 18.3741C29.2341 17.2596 29.3579 16.3928 29.3579 15.6498C29.3579 8.09176 22.9144 2.39538 15.2367 2.89072C8.66938 3.26222 3.34451 8.59122 2.84917 15.0306C2.35383 22.7124 8.42584 29.1518 15.9797 29.1518V32C6.68803 32 -0.622312 24.1943 -0.00314176 14.9026C0.620157 6.97725 6.93983 0.533745 14.9932 0.0384085Z" fill="currentColor"/>
          </g>
          <defs>
            <clipPath id="clip0_3843_101374">
              <rect width="32" height="32" fill="none"/>
            </clipPath>
          </defs>
        </svg>
      </a>
    `,
  })

  logseq.App.registerCommandPalette(
    {
      key: 'omnivore-sync',
      label: 'Sync Omnivore',
    },
    () => {
      void (async () => {
        await fetchOmnivore()
      })()
    }
  )

  logseq.App.registerCommandPalette(
    {
      key: 'omnivore-resync',
      label: 'Resync all Omnivore articles',
    },
    () => {
      void (async () => {
        // reset the last sync time
        logseq.updateSettings({ syncAt: '' })
        await logseq.UI.showMsg('Omnivore Last Sync reset', 'warning', {
          timeout: 3000,
        })

        await fetchOmnivore()
      })()
    }
  )

  logseq.provideStyle(`
    div[data-id="${baseInfo.id}"] div[data-key="articleTemplate"] textarea {
      height: 30rem;
    }
  `)

  // reset loading state on startup
  resetState()

  // fetch articles on startup
  if (await isValidCurrentGraph()) {
    await fetchOmnivore(true)
  }

  // start the sync job
  startSyncJob()
}

// reset loading state before plugin unload
logseq.beforeunload(async () => {
  console.log('beforeunload')
  resetState()
  return Promise.resolve()
})

// bootstrap
logseq.ready(main).catch(console.error)
