import '@logseq/libs'
import { LSPluginBaseInfo } from '@logseq/libs/dist/LSPlugin'
import * as icon from './icon.png'

const delay = (t = 100) => new Promise((r) => setTimeout(r, t))
const endpoint = 'https://api-prod.omnivore.app/api/graphql'

interface GetArticleResponse {
  data: {
    article: {
      article: Article
    }
  }
}

interface SearchResponse {
  data: {
    search: {
      edges: { node: Article }[]
      pageInfo: {
        hasNextPage: boolean
      }
    }
  }
}

interface Article {
  title: string
  author: string
  description: string
  slug: string
  labels: Label[]
  highlights: Highlight[]
  savedAt: string
}

interface Label {
  name: string
}

interface Highlight {
  quote: string
}

async function loadArticle(
  username: string,
  slug: string,
  token: string
): Promise<Article> {
  const res = await fetch(endpoint, {
    headers: {
      'content-type': 'application/json',
      authorization: token,
    },
    body: `{"query":"\\n  query GetArticle(\\n    $username: String!\\n    $slug: String!\\n    $includeFriendsHighlights: Boolean\\n  ) {\\n    article(username: $username, slug: $slug) {\\n      ... on ArticleSuccess {\\n        article {\\n          ...ArticleFields\\n          content\\n          highlights(input: { includeFriends: $includeFriendsHighlights }) {\\n            ...HighlightFields\\n          }\\n          labels {\\n            ...LabelFields\\n          }\\n        }\\n      }\\n      ... on ArticleError {\\n        errorCodes\\n      }\\n    }\\n  }\\n  \\n  fragment ArticleFields on Article {\\n    id\\n    title\\n    url\\n    author\\n    image\\n    savedAt\\n    createdAt\\n    publishedAt\\n    contentReader\\n    originalArticleUrl\\n    readingProgressPercent\\n    readingProgressAnchorIndex\\n    slug\\n    isArchived\\n    description\\n    linkId\\n    state\\n  }\\n\\n  \\n  fragment HighlightFields on Highlight {\\n    id\\n    shortId\\n    quote\\n    prefix\\n    suffix\\n    patch\\n    annotation\\n    createdByMe\\n    updatedAt\\n    sharedAt\\n  }\\n\\n  \\n  fragment LabelFields on Label {\\n    id\\n    name\\n    color\\n    description\\n    createdAt\\n  }\\n\\n","variables":{"username":"${username}","slug":"${slug}","includeFriendsHighlights":false}}`,
    method: 'POST',
  })
  const response = (await res.json()) as GetArticleResponse

  return response.data.article.article
}

async function loadArticles(
  token: string,
  after = 0,
  first = 10,
  savedAfter = ''
): Promise<[Article[], boolean]> {
  const res = await fetch(endpoint, {
    headers: {
      'content-type': 'application/json',
      authorization: token,
    },
    body: `{"query":"\\n    query Search($after: String, $first: Int, $query: String) {\\n      search(first: $first, after: $after, query: $query) {\\n        ... on SearchSuccess {\\n          edges {\\n            cursor\\n            node {\\n              id\\n              title\\n              slug\\n              url\\n              pageType\\n              contentReader\\n              createdAt\\n              isArchived\\n              readingProgressPercent\\n              readingProgressAnchorIndex\\n              author\\n              image\\n              description\\n              publishedAt\\n              ownedByViewer\\n              originalArticleUrl\\n              uploadFileId\\n              labels {\\n                id\\n                name\\n                color\\n              }\\n              pageId\\n              shortId\\n              quote\\n              annotation\\n              state\\n              siteName\\n            }\\n          }\\n          pageInfo {\\n            hasNextPage\\n            hasPreviousPage\\n            startCursor\\n            endCursor\\n            totalCount\\n          }\\n        }\\n        ... on SearchError {\\n          errorCodes\\n        }\\n      }\\n    }\\n  ","variables":{"after":"${after}","first":${first}, "query":"${
      savedAfter ? 'saved:' + savedAfter : ''
    } sort:saved-asc"}}`,
    method: 'POST',
  })

  const jsonRes = (await res.json()) as SearchResponse

  const articles = jsonRes.data.search.edges.map((e) => e.node)

  return [articles, jsonRes.data.search.pageInfo.hasNextPage]
}

/**
 * main entry
 * @param baseInfo
 */
function main(baseInfo: LSPluginBaseInfo) {
  let loading = false
  const token = logseq.settings?.['api key'] as string
  const username = logseq.settings?.['username'] as string

  logseq.provideModel({
    async loadOmnivore() {
      // const info = await logseq.App.getUserConfigs();
      if (loading) return

      const pageName = 'Omnivore'
      const blockTitle = '## 🔖 Articles'
      const highlightTitle = '### 🔍 Highlights'
      const labelTitle = '### 🏷 Labels'
      const dateTitle = '### 📅 Date'
      const fetchingTitle = '🚀 Fetching articles ...'

      logseq.App.pushState('page', { name: pageName })

      await delay(300)

      loading = true

      try {
        await logseq.UI.showMsg('🚀 Fetching articles ...')

        const currentPage = await logseq.Editor.getCurrentPage()
        if (currentPage?.originalName !== pageName)
          throw new Error('page error')

        const pageBlocksTree = await logseq.Editor.getCurrentPageBlocksTree()
        let targetBlock = pageBlocksTree[0]!
        let lastUpdateAt = ''
        if (targetBlock) {
          const matches = targetBlock.content.match(
            /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{3})Z/g
          )
          if (matches) {
            lastUpdateAt = matches[0]
          }
          await logseq.Editor.updateBlock(targetBlock.uuid, fetchingTitle)
        } else {
          targetBlock = (await logseq.Editor.insertBlock('', fetchingTitle, {
            before: true,
          }))!
        }

        const size = 100
        let after = 0
        /*eslint no-constant-condition: ["error", { "checkLoops": false }]*/
        while (true) {
          const [articles, hasNextPage] = await loadArticles(
            token,
            after,
            size,
            lastUpdateAt
          )

          for (const { title, author, description, slug } of articles) {
            const { labels, highlights, savedAt } = await loadArticle(
              username,
              slug,
              token
            )

            const content = `[${title}](https://omnivore.app/${username}/${slug}) [:small.opacity-50 "By ${author?.replace(
              /"/g,
              '\\"'
            )}"] 📅 [[${new Date(savedAt).toDateString()}]] ${
              labels
                ? ' 🏷 ' +
                  labels.map((l: { name: string }) => `[[${l.name}]]`).join(' ')
                : ''
            }
            collapsed:: true    
            > ${description}.`

            const articleBlock = (await logseq.Editor.insertBlock(
              targetBlock.uuid,
              content,
              { before: true, sibling: false }
            ))!

            if (highlights?.length) {
              const highlightBlock = (await logseq.Editor.insertBlock(
                articleBlock.uuid,
                highlightTitle
              ))!

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

        await logseq.Editor.updateBlock(
          targetBlock.uuid,
          `${blockTitle} [:small.opacity-20 "fetched at ${new Date().toISOString()}"]`
        )
        await logseq.UI.showMsg('🔖 Articles fetched')
      } catch (e) {
        await logseq.UI.showMsg(e as string, 'warning')
        console.error(e)
      } finally {
        loading = false
      }
    },
  })

  logseq.App.registerUIItem('toolbar', {
    key: 'logseq-omnivore',
    template: `
      <a data-on-click="loadOmnivore" class="button" style="width:2rem;height:2rem;">
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
}

// bootstrap
logseq.ready(main).catch(console.error)
