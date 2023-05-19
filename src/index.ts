import '@logseq/libs'
import {
  BlockEntity,
  IBatchBlock,
  LSPluginBaseInfo,
} from '@logseq/libs/dist/LSPlugin'
import { PageEntity } from '@logseq/libs/dist/LSPlugin.user'
import { DateTime } from 'luxon'
import {
  Article,
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
  preParseTemplate,
  renderArticleContent,
  renderHighlightContent,
  renderPageName,
} from './settings/template'
import {
  DATE_FORMAT,
  compareHighlightsInFile,
  escapeQuotes,
  getHighlightLocation,
  isBlockPropertiesChanged,
  parseBlockProperties,
  parseDateTime,
} from './util'

const isValidCurrentGraph = async (): Promise<boolean> => {
  const settings = logseq.settings as Settings
  const currentGraph = await logseq.App.getCurrentGraph()

  return currentGraph?.name === settings.graph
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

const getBlockByContent = async (
  pageName: string,
  parentBlockId: string,
  content: string
): Promise<BlockEntity | undefined> => {
  const blocks = (
    await logseq.DB.datascriptQuery<BlockEntity[]>(
      `[:find (pull ?b [*])
            :where
              [?b :block/page ?p]
              [?p :block/original-name "${escapeQuotes(pageName)}"]
              [?b :block/parent ?parent]
              [?parent :block/uuid ?u]
              [(str ?u) ?s]
              [(= ?s "${parentBlockId}")]
              [?b :block/content ?c]
              [(clojure.string/includes? ?c "${escapeQuotes(content)}")]]`
    )
  ).flat()

  return blocks[0]
}

const getBlockByTitle = async (
  pageName: string,
  title: string
): Promise<BlockEntity | null> => {
  const blocks = (
    await logseq.DB.datascriptQuery<BlockEntity[]>(
      `[:find (pull ?b [*])
            :where
              [?b :block/page ?p]
              [?p :block/original-name "${escapeQuotes(pageName)}"]
              [?b :block/content ?c]
              [(= ?c "${escapeQuotes(title)}")]]`
    )
  ).flat()

  return blocks[0] || null
}

const getOmnivorePage = async (pageName: string): Promise<PageEntity> => {
  const omnivorePage = await logseq.Editor.getPage(pageName)
  if (omnivorePage) {
    return omnivorePage
  }

  const newOmnivorePage = await logseq.Editor.createPage(pageName, undefined, {
    createFirstBlock: false,
  })
  if (!newOmnivorePage) {
    await logseq.UI.showMsg(
      'Failed to create Omnivore page. Please check the pageName in the settings',
      'error'
    )
    throw new Error('Failed to create Omnivore page')
  }

  return newOmnivorePage
}

const getOmnivoreBlock = async (
  pageName: string,
  title: string
): Promise<BlockEntity> => {
  const page = await getOmnivorePage(pageName)
  const targetBlock = await getBlockByTitle(pageName, title)
  if (targetBlock) {
    return targetBlock
  }
  const newTargetBlock = await logseq.Editor.appendBlockInPage(page.uuid, title)
  if (!newTargetBlock) {
    await logseq.UI.showMsg('Failed to create Omnivore block', 'error')
    throw new Error('Failed to create Omnivore block')
  }

  return newTargetBlock
}

const fetchOmnivore = async (inBackground = false) => {
  const {
    syncAt,
    apiKey,
    filter,
    customQuery,
    highlightOrder,
    pageName: pageNameTemplate,
    articleTemplate,
    highlightTemplate,
    graph,
    loading,
    endpoint,
    isSinglePage,
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
  const highlightTitle = '### Highlights'

  const userConfigs = await logseq.App.getUserConfigs()
  const preferredDateFormat: string = userConfigs.preferredDateFormat
  const fetchingMsgKey = 'omnivore-fetching'

  try {
    console.log(`logseq-omnivore starting sync since: '${syncAt}`)
    !inBackground &&
      (await logseq.UI.showMsg(fetchingTitle, 'success', {
        key: fetchingMsgKey,
      }))

    let targetBlockId = ''
    let pageName = ''

    if (isSinglePage) {
      // create a single page for all articles
      pageName = pageNameTemplate
      targetBlockId = (await getOmnivoreBlock(pageName, blockTitle)).uuid
      !inBackground && logseq.App.pushState('page', { name: pageName })
    }

    // pre-parse templates
    preParseTemplate(articleTemplate)
    preParseTemplate(highlightTemplate)

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
      const articleBatchMap: Map<string, IBatchBlock[]> = new Map()
      for (const article of articles) {
        if (!isSinglePage) {
          // create a new page for each article
          pageName = renderPageName(
            article,
            pageNameTemplate,
            preferredDateFormat
          )
          targetBlockId = (await getOmnivoreBlock(pageName, blockTitle)).uuid
        }
        const articleBatch = articleBatchMap.get(targetBlockId) || []
        // render article content
        const articleContent = renderArticleContent(
          articleTemplate,
          article,
          preferredDateFormat
        )
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
            // Render highlight content string based on highlight template
            const content = renderHighlightContent(
              highlightTemplate,
              it,
              article,
              preferredDateFormat
            )
            return {
              content,
              properties: {
                id: it.id,
              },
            }
          }) || []

        // create highlight title block
        const highlightTitleBlock: IBatchBlock = {
          content: highlightTitle,
          children: highlightBatch,
        }
        // update existing article block if article is already in the page
        const existingArticleBlock = await getBlockByContent(
          pageName,
          targetBlockId,
          article.slug
        )
        if (existingArticleBlock) {
          const existingArticleProperties = existingArticleBlock.properties
          const newArticleProperties = parseBlockProperties(articleContent)
          // update the existing article block if any of the properties have changed
          if (
            isBlockPropertiesChanged(
              newArticleProperties,
              existingArticleProperties
            )
          ) {
            await logseq.Editor.updateBlock(
              existingArticleBlock.uuid,
              articleContent
            )
          }
          if (highlightBatch.length > 0) {
            let parentBlockId = existingArticleBlock.uuid
            // check if highlight title block exists
            const existingHighlightTitleBlock = await getBlockByContent(
              pageName,
              existingArticleBlock.uuid,
              highlightTitleBlock.content
            )
            if (existingHighlightTitleBlock) {
              parentBlockId = existingHighlightTitleBlock.uuid
            } else {
              // append new highlight title block
              const newHighlightTitleBlock = await logseq.Editor.insertBlock(
                existingArticleBlock.uuid,
                highlightTitle,
                {
                  sibling: false,
                  before: true,
                }
              )
              if (newHighlightTitleBlock) {
                const existingArticleBlockWithChildren =
                  await logseq.Editor.getBlock(existingArticleBlock.uuid, {
                    includeChildren: true,
                  })
                const existingHighlightBlocks =
                  (existingArticleBlockWithChildren?.children ||
                    []) as BlockEntity[]
                // and move existing highlights to new highlight title block
                for (const highlight of existingHighlightBlocks) {
                  await logseq.Editor.moveBlock(
                    highlight.uuid,
                    newHighlightTitleBlock.uuid,
                    {
                      children: true,
                    }
                  )
                }
                parentBlockId = newHighlightTitleBlock.uuid
              }
            }
            // append new highlights to existing article block
            for (const highlight of highlightBatch) {
              // check if highlight block exists
              const existingHighlightBlock = await getBlockByContent(
                pageName,
                parentBlockId,
                highlight.properties?.id as string
              )
              if (existingHighlightBlock) {
                // update existing highlight if content is different
                if (existingHighlightBlock.content !== highlight.content) {
                  await logseq.Editor.updateBlock(
                    existingHighlightBlock.uuid,
                    highlight.content
                  )
                }
              } else {
                // append new highlight to existing article block
                await logseq.Editor.insertBatchBlock(parentBlockId, highlight, {
                  sibling: false,
                })
              }
            }
          }
        } else {
          // append new article block
          articleBatch.unshift({
            content: articleContent,
            children: highlightBatch.length > 0 ? [highlightTitleBlock] : [], // add highlight title block if there are highlights
          })
          articleBatchMap.set(targetBlockId, articleBatch)
        }
      }

      for await (const [targetBlockId, articleBatch] of articleBatchMap) {
        await logseq.Editor.insertBatchBlock(targetBlockId, articleBatch, {
          before: true,
          sibling: false,
        })
      }
    }
    // delete blocks where article has been deleted from omnivore
    for (
      let hasNextPage = true, deletedArticles: Article[] = [], after = 0;
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
      for await (const deletedArticle of deletedArticles) {
        if (!isSinglePage) {
          pageName = renderPageName(
            deletedArticle,
            pageNameTemplate,
            preferredDateFormat
          )
          targetBlockId = (await getOmnivoreBlock(pageName, blockTitle)).uuid

          // delete page if article is synced to a separate page and page is not a journal
          const existingPage = await logseq.Editor.getPage(pageName)
          if (existingPage && !existingPage['journal?']) {
            await logseq.Editor.deletePage(pageName)
            continue
          }
        }

        const existingBlock = await getBlockByContent(
          pageName,
          targetBlockId,
          deletedArticle.slug
        )

        if (existingBlock) {
          await logseq.Editor.removeBlock(existingBlock.uuid)
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
  }
}

/**
 * main entry
 * @param baseInfo
 */
const main = async (baseInfo: LSPluginBaseInfo) => {
  console.log('logseq-omnivore loaded')

  logseq.useSettingsSchema(await settingsSchema())
  // update version if needed
  const latestVersion = baseInfo.version as string
  const currentVersion = (logseq.settings as Settings).version
  if (latestVersion !== currentVersion) {
    logseq.updateSettings({ version: latestVersion })
    // show release notes
    const releaseNotes = `Omnivore plugin is upgraded to ${latestVersion}.
    
    What's new: https://github.com/omnivore-app/logseq-omnivore/blob/main/CHANGELOG.md
    `
    await logseq.UI.showMsg(releaseNotes, 'success', {
      timeout: 10000,
    })
  }

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

  logseq.provideStyle(`
    div[data-id="${baseInfo.id}"] div[data-key="highlightTemplate"] textarea {
      height: 10rem;
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
