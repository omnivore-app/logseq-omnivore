import '@logseq/libs'
import {
  BlockEntity,
  LSPluginBaseInfo,
  SettingSchemaDesc,
} from '@logseq/libs/dist/LSPlugin'
import * as icon from './icon.png'
import { loadArticle, loadArticles } from './util'

const settings: SettingSchemaDesc[] = [
  {
    key: 'api key',
    type: 'string',
    title: 'Enter Omnivore Api Key',
    description: 'Enter Omnivore Api Key here',
    default: '',
  },
  {
    key: 'username',
    type: 'string',
    title: 'Enter Omnivore username',
    description: 'Enter Omnivore username here',
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
]
const delay = (t = 100) => new Promise((r) => setTimeout(r, t))
let loading = false

const fetchOmnivore = async (
  apiKey: string,
  username: string,
  inBackground = false
): Promise<void> => {
  if (loading) return

  if (!apiKey || !username) {
    await logseq.UI.showMsg('Missing Omnivore username or api key', 'warning')

    return
  }

  const pageName = 'Omnivore'
  const blockTitle = '## 🔖 Articles'
  const highlightTitle = '### 🔍 [[Highlights]]'
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
    let after = 0
    /*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
    while (true) {
      const [articles, hasNextPage] = await loadArticles(
        apiKey,
        after,
        size,
        lastUpdateAt
      )

      for (const { title, author, slug, description } of articles) {
        const { labels, highlights, savedAt } = await loadArticle(
          username,
          slug,
          apiKey
        )

        const content = `[${title}](https://omnivore.app/${username}/${slug})
        collapsed:: true
        author:: "${author}"
        labels:: ${
          labels
            ? labels.map((l: { name: string }) => `[[${l.name}]]`).join(' ')
            : 'null'
        }
        date:: ${new Date(savedAt).toDateString()}
        > ${description}`

        const articleBlock = await logseq.Editor.insertBlock(
          targetBlock.uuid,
          content,
          { before: true, sibling: false }
        )
        if (!articleBlock) {
          throw new Error('block error')
        }

        if (highlights?.length) {
          const highlightBlock = await logseq.Editor.insertBlock(
            articleBlock.uuid,
            highlightTitle
          )
          if (!highlightBlock) {
            throw new Error('block error')
          }

          for (const highlight of highlights) {
            await logseq.Editor.insertBlock(
              highlightBlock.uuid,
              highlight.quote
            )
          }
        }

        // sleep for a second to avoid rate limit
        await delay(1000)
      }

      if (!hasNextPage) {
        break
      }
      after += size
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
  username: string,
  frequency: number
): number => {
  let intervalID = 0
  // sync every frequency minutes
  if (frequency > 0) {
    intervalID = setInterval(async () => {
      await fetchOmnivore(apiKey, username, true)
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
  let username = logseq.settings?.['username'] as string
  let frequency = logseq.settings?.frequency as number
  let intervalID: number

  logseq.onSettingsChanged(() => {
    apiKey = logseq.settings?.['api key'] as string
    username = logseq.settings?.['username'] as string
    const newFrequency = logseq.settings?.frequency as number
    if (newFrequency !== frequency) {
      if (intervalID) {
        clearInterval(intervalID)
      }
      frequency = newFrequency
      intervalID = syncOmnivore(apiKey, username, frequency)
    }
  })

  logseq.provideModel({
    async loadOmnivore() {
      await fetchOmnivore(apiKey, username)
    },
  })

  logseq.App.registerUIItem('toolbar', {
    key: 'logseq-omnivore',
    template: `
      <a data-on-click="loadOmnivore" class="button" style="width:3rem;height:3rem;">
        <img src="${icon as string}">
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
  await fetchOmnivore(apiKey, username, true)

  // sync every frequency minutes
  intervalID = syncOmnivore(apiKey, username, frequency)
}

// bootstrap
logseq.ready(main).catch(console.error)
