import '@logseq/libs'
import {
  BlockEntity,
  IBatchBlock,
  LSPluginBaseInfo,
  SettingSchemaDesc,
} from '@logseq/libs/dist/LSPlugin'
import { getDateForPage } from 'logseq-dateutils'
import icon from '../public/icon.png'
import { Article, loadArticles } from './util'
import { DateTime } from 'luxon'

enum Filter {
  ALL = 'import all my articles',
  HIGHLIGHTS = 'import just highlights',
  ADVANCED = 'advanced',
}

interface Settings {
  apiKey: string
  filter: Filter
  syncAt: string
  frequency: number
  graph: string
  customQuery: string
  disabled: boolean
}

const siteNameFromUrl = (originalArticleUrl: string): string => {
  try {
    return new URL(originalArticleUrl).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

const delay = (t = 100) => new Promise((r) => setTimeout(r, t))
const DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss"
let loading = false

const getQueryFromFilter = (filter: Filter, customQuery: string): string => {
  switch (filter) {
    case Filter.ALL:
      return ''
    case Filter.HIGHLIGHTS:
      return `has:highlights`
    case Filter.ADVANCED:
      return customQuery
    default:
      return ''
  }
}

const fetchOmnivore = async (inBackground = false) => {
  if (loading) return

  const { syncAt, apiKey, filter, customQuery } = logseq.settings as Settings

  if (!apiKey) {
    await logseq.UI.showMsg('Missing Omnivore api key', 'warning')

    return
  }

  const pageName = 'Omnivore'
  const blockTitle = '## 🔖 Articles'
  const fetchingTitle = '🚀 Fetching articles ...'

  !inBackground && logseq.App.pushState('page', { name: pageName })

  await delay(300)

  loading = true
  let targetBlock: BlockEntity | null = null
  const userConfigs = await logseq.App.getUserConfigs()
  const preferredDateFormat: string = userConfigs.preferredDateFormat

  try {
    !inBackground && (await logseq.UI.showMsg('🚀 Fetching articles ...'))

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
      ;[articles, hasNextPage] = await loadArticles(
        apiKey,
        after,
        size,
        syncAt,
        getQueryFromFilter(filter, customQuery)
      )

      const articleBatch: IBatchBlock[] = []
      for (const article of articles) {
        // Build content string
        let content = `[${article.title}](https://omnivore.app/me/${article.slug})`
        content += '\ncollapsed:: true'

        const displaySiteName =
          article.siteName || siteNameFromUrl(article.originalArticleUrl)
        if (displaySiteName) {
          content += `\nsite:: [${displaySiteName}](${article.originalArticleUrl})`
        }

        if (article.author) {
          content += `\nauthor:: ${article.author}`
        }

        if (article.labels && article.labels.length > 0) {
          content += `\nlabels:: ${article.labels
            .map((l) => `[[${l.name}]]`)
            .join()}`
        }

        content += `\ndate_saved:: ${getDateForPage(
          new Date(article.savedAt),
          preferredDateFormat
        )}`

        // remove existing block for the same article
        const existingBlocks = await logseq.DB.q<BlockEntity>(
          `"${article.slug}"`
        )
        if (existingBlocks) {
          for (const block of existingBlocks) {
            block.uuid && (await logseq.Editor.removeBlock(block.uuid))
          }
        }

        const highlightBatch = article.highlights?.map((it) => {
          const noteChild = it.annotation
            ? { content: it.annotation }
            : undefined
          return {
            content: `>> ${it.quote} [⤴️](https://omnivore.app/me/${article.slug}#${it.id})`,
            children: noteChild ? [noteChild] : undefined,
          }
        })

        articleBatch.unshift({
          content,
          children: highlightBatch,
        })
      }

      articleBatch.length > 0 &&
        (await logseq.Editor.insertBatchBlock(targetBlock.uuid, articleBatch, {
          before: true,
          sibling: false,
        }))
    }

    !inBackground && (await logseq.UI.showMsg('🔖 Articles fetched'))
    logseq.updateSettings({ syncAt: DateTime.local().toFormat(DATE_FORMAT) })
  } catch (e) {
    !inBackground &&
      (await logseq.UI.showMsg('Failed to fetch articles', 'warning'))
    console.error(e)
  } finally {
    loading = false
    targetBlock &&
      (await logseq.Editor.updateBlock(targetBlock.uuid, blockTitle))
  }
}

const syncOmnivore = (): number => {
  const settings = logseq.settings as Settings

  let intervalID = 0
  // sync every frequency minutes
  if (settings.frequency > 0) {
    intervalID = setInterval(
      async () => {
        if ((await logseq.App.getCurrentGraph())?.name === settings.graph) {
          await fetchOmnivore(true)
        }
      },
      settings.frequency * 1000 * 60,
      settings.syncAt
    )
  }

  return intervalID
}

/**
 * main entry
 * @param baseInfo
 */
const main = async (baseInfo: LSPluginBaseInfo) => {
  console.log('logseq-omnivore loaded')

  const settingsSchema: SettingSchemaDesc[] = [
    {
      key: 'apiKey',
      type: 'string',
      title: 'Enter Omnivore Api Key',
      description: 'Enter Omnivore Api Key here',
      default: logseq.settings?.['api key'] as string,
    },
    {
      key: 'filter',
      type: 'enum',
      title: 'Select a filter for Omnivore articles',
      description: 'Select a filter for Omnivore articles',
      default: Filter.HIGHLIGHTS.toString(),
      enumPicker: 'select',
      enumChoices: Object.values(Filter),
    },
    {
      key: 'customQuery',
      type: 'string',
      title: 'Enter custom query if advanced filter is selected',
      description:
        'Enter a custom query for Omnivore articles here. e.g. "has:highlights"',
      default: '',
    },
    {
      key: 'frequency',
      type: 'number',
      title: 'Enter sync with Omnivore frequency',
      description:
        'Enter sync with Omnivore frequency in minutes here or 0 to disable',
      default: 60,
    },
    {
      key: 'graph',
      type: 'string',
      title: 'Enter the graph to sync with Omnivore',
      description: 'Enter the graph to sync Omnivore articles to',
      // default is the current graph
      default: (await logseq.App.getCurrentGraph())?.name as string,
    },
    {
      key: 'syncAt',
      type: 'string',
      title: 'Enter Omnivore sync timestamp',
      description: 'Enter Omnivore timestamp',
      default: DateTime.fromISO(logseq.settings?.['synced at'] as string)
        .toLocal()
        .toFormat(DATE_FORMAT),
      inputAs: 'datetime-local',
    },
  ]
  logseq.useSettingsSchema(settingsSchema)

  const frequency = logseq.settings?.frequency as number
  let intervalID: number

  logseq.onSettingsChanged(() => {
    const settings = logseq.settings as Settings
    const newFrequency = settings.frequency
    if (newFrequency !== frequency) {
      // remove existing scheduled task and create new one
      if (intervalID) {
        clearInterval(intervalID)
      }
      if (newFrequency > 0) {
        intervalID = syncOmnivore()
      }
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
      <a data-on-click="loadOmnivore" class="button" style="width:3rem;height:3rem;">
        <img src="${icon}">
      </a>
    `,
  })

  logseq.provideStyle(`
    [data-injected-ui=logseq-omnivore-${baseInfo.id}] {
      display: flex;
      align-items: center;
    }
  `)

  // fetch articles on startup
  await fetchOmnivore(true)

  // sync every frequency minutes
  intervalID = syncOmnivore()
}

// bootstrap
logseq.ready(main).catch(console.error)
