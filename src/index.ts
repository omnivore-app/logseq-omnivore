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

const settings: SettingSchemaDesc[] = [
  {
    key: 'api key',
    type: 'string',
    title: 'Enter Omnivore Api Key',
    description: 'Enter Omnivore Api Key here',
    default: '',
  },
  {
    key: 'filter',
    type: 'string',
    title: 'Enter a filter for Omnivore articles',
    description:
      'Enter a filter for Omnivore articles here. e.g. "has:highlights"',
    default: 'has:highlights',
  },
  {
    key: 'frequency',
    type: 'number',
    title: 'Enter sync with Omnivore frequency',
    description:
      'Enter sync with Omnivore frequency in minutes here or 0 to disable',
    default: 60,
  },
]

const siteNameFromUrl = (originalArticleUrl: string): string => {
  try {
    return new URL(originalArticleUrl).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

const delay = (t = 100) => new Promise((r) => setTimeout(r, t))
let loading = false

const fetchOmnivore = async (
  apiKey: string,
  filter: string,
  syncAt: string,
  inBackground = false
): Promise<string> => {
  if (loading) return syncAt

  if (!apiKey) {
    await logseq.UI.showMsg('Missing Omnivore api key', 'warning')

    return syncAt
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
        filter
      )

      const articleBatch: IBatchBlock[] = []
      for (const article of articles) {
        // Build content string
        let content = `[${article.title}](https://omnivore.app/me/${article.slug})`
        content += '\ncollapsed:: true'

        const displaySiteName =
          article.siteName || siteNameFromUrl(article.originalArticleUrl)
        console.log('display site name', displaySiteName)
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
        if (existingBlocks && existingBlocks.length > 0) {
          for (const block of existingBlocks) {
            await logseq.Editor.removeBlock(block.uuid)
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

    syncAt = new Date().toISOString()
    !inBackground && (await logseq.UI.showMsg('🔖 Articles fetched'))

    return syncAt
  } catch (e) {
    !inBackground &&
      (await logseq.UI.showMsg('Failed to fetch articles', 'warning'))
    console.error(e)

    return syncAt
  } finally {
    loading = false
    targetBlock &&
      (await logseq.Editor.updateBlock(targetBlock.uuid, blockTitle))
    logseq.updateSettings({ 'synced at': syncAt })
  }
}

const syncOmnivore = (
  apiKey: string,
  frequency: number,
  filter: string,
  syncAt: string
): number => {
  let intervalID = 0
  // sync every frequency minutes
  if (frequency > 0) {
    intervalID = setInterval(
      async () => {
        syncAt = await fetchOmnivore(apiKey, filter, syncAt, true)
      },
      frequency * 1000 * 60,
      syncAt
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

  logseq.useSettingsSchema(settings)

  let apiKey = logseq.settings?.['api key'] as string
  let frequency = logseq.settings?.frequency as number
  let filter = logseq.settings?.filter as string
  let syncAt = logseq.settings?.['synced at'] as string
  let intervalID: number

  logseq.onSettingsChanged(() => {
    apiKey = logseq.settings?.['api key'] as string
    filter = logseq.settings?.filter as string
    syncAt = logseq.settings?.['synced at'] as string
    // remove existing scheduled task and create new one
    const newFrequency = logseq.settings?.frequency as number
    if (newFrequency !== frequency) {
      if (intervalID) {
        clearInterval(intervalID)
      }
      frequency = newFrequency
      intervalID = syncOmnivore(apiKey, frequency, filter, syncAt)
    }
  })

  logseq.provideModel({
    async loadOmnivore() {
      await fetchOmnivore(apiKey, filter, syncAt)
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
  await fetchOmnivore(apiKey, filter, syncAt, true)

  // sync every frequency minutes
  intervalID = syncOmnivore(apiKey, frequency, filter, syncAt)
}

// bootstrap
logseq.ready(main).catch(console.error)
