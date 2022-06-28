import '@logseq/libs'
import {
  BlockEntity,
  LSPluginBaseInfo,
  SettingSchemaDesc,
} from '@logseq/libs/dist/LSPlugin'
import icon from './icon.png'
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
    key: 'frequency',
    type: 'number',
    title: 'Enter sync with Omnivore frequency',
    description:
      'Enter sync with Omnivore frequency in minutes here or 0 to disable',
    default: 60,
  },
  {
    key: 'filter',
    type: 'string',
    title: 'Enter a filter for Omnivore articles',
    description:
      'Enter a filter for Omnivore articles here. e.g. "has:highlights"',
    default: 'has:highlights',
  },
]
const delay = (t = 100) => new Promise((r) => setTimeout(r, t))
let loading = false

const fetchOmnivore = async (
  apiKey: string,
  filter: string,
  inBackground = false
): Promise<void> => {
  if (loading) return

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
  let lastFetchedAt = ''

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
    let lastUpdateAt = ''
    if (targetBlock) {
      const matches = targetBlock.content.match(
        /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{3})Z/g
      )
      if (matches) {
        lastUpdateAt = matches[0]
      } else {
        lastUpdateAt = logseq.settings?.['synced at'] as string
      }
      lastFetchedAt = lastUpdateAt
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

    const size = 100
    for (
      let hasNextPage = true, articles: Article[] = [], after = 0;
      hasNextPage;
      after += size
    ) {
      ;[articles, hasNextPage] = await loadArticles(
        apiKey,
        after,
        size,
        lastUpdateAt,
        filter
      )

      for (const article of articles) {
        // Build content string
        let content = `[${article.title}](https://omnivore.app/me/${article.slug})`
        content += '\ncollapsed:: true'
        if (article.author) {
          content += `\nauthor:: ${article.author}`
        }

        if (article.labels && article.labels.length > 0) {
          content += `\nlabels:: ${article.labels.map((l) => l.name).join()}`
        }

        content += `\ndate_saved:: ${new Date(article.savedAt).toDateString()}`

<<<<<<< HEAD
        if (article.description) {
          content += `\n> ${article.description}`
        }

=======
>>>>>>> 78903e4 (Show Read in Omnivore inline at end of highlights, show notes in a block, dont show description)
        // remove existing block for the same article
        const existingBlocks = await logseq.DB.q<BlockEntity>(
          `"${article.slug}"`
        )
        if (existingBlocks && existingBlocks.length > 0) {
          for (const block of existingBlocks) {
            await logseq.Editor.removeBlock(block.uuid)
          }
        }

        const articleBlock = await logseq.Editor.insertBlock(
          targetBlock.uuid,
          content,
          { before: true, sibling: false }
        )
        if (!articleBlock) {
          throw new Error('block error')
        }

        if (article.highlights && article.highlights.length > 0) {
          const highlightBatch = article.highlights.map(it => {
            const noteChild = it.annotation ? { content: it.annotation } : undefined
            return {
              content: `>> ${it.quote} -- [Read in Omnivore](https://omnivore.app/me/${slug}#${it.id})`,
              children: [
                noteChild
              ].filter((c) => c) as IBatchBlock[]
            }
          })
          await logseq.Editor.insertBatchBlock(articleBlock.uuid, highlightBatch, {
            sibling: false
          })
        }

        // sleep for a second to avoid rate limit
        await delay(1000)
      }
    }

    !inBackground && (await logseq.UI.showMsg('🔖 Articles fetched'))
  } catch (e) {
    !inBackground &&
      (await logseq.UI.showMsg('Failed to fetch articles', 'warning'))
    console.error(e)
  } finally {
    loading = false
    if (targetBlock) {
      lastFetchedAt = new Date().toISOString()

      await logseq.Editor.updateBlock(
        targetBlock.uuid,
        `${blockTitle} [:small.opacity-20 "fetched at ${lastFetchedAt}"]`
      )

      logseq.updateSettings({ 'synced at': lastFetchedAt })
    }
  }
}

const syncOmnivore = (
  apiKey: string,
  frequency: number,
  filter: string
): number => {
  let intervalID = 0
  // sync every frequency minutes
  if (frequency > 0) {
    intervalID = setInterval(async () => {
      await fetchOmnivore(apiKey, filter, true)
    }, frequency * 1000 * 60)
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
  let intervalID: number

  logseq.onSettingsChanged(() => {
    apiKey = logseq.settings?.['api key'] as string
    filter = logseq.settings?.filter as string
    const newFrequency = logseq.settings?.frequency as number
    if (newFrequency !== frequency) {
      if (intervalID) {
        clearInterval(intervalID)
      }
      frequency = newFrequency
      intervalID = syncOmnivore(apiKey, frequency, filter)
    }
  })

  logseq.provideModel({
    async loadOmnivore() {
      await fetchOmnivore(apiKey, filter)
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
  await fetchOmnivore(apiKey, filter, true)

  // sync every frequency minutes
  intervalID = syncOmnivore(apiKey, frequency, filter)
}

// bootstrap
logseq.ready(main).catch(console.error)
