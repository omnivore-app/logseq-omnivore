import { BlockEntity } from '@logseq/libs/dist/LSPlugin'
import { loadArticle, loadArticles, delay } from './util'

export const fetchArtifacts = async (
  apiKey: string,
  username: string,
  inBackground = false
): Promise<void> => {
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

        // remove existing block for the same article
        const existingBlocks = await logseq.DB.q<BlockEntity>(`"${slug}"`)
        if (existingBlocks && existingBlocks.length > 0) {
          console.log(existingBlocks)
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
