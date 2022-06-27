export interface GetArticleResponse {
  data: {
    article: {
      article: Article
    }
  }
}

export interface SearchResponse {
  data: {
    search: {
      edges: { node: Article }[]
      pageInfo: {
        hasNextPage: boolean
      }
    }
  }
}

export interface Article {
  title: string
  author: string
  description: string
  slug: string
  labels: Label[]
  highlights: Highlight[]
  updatedAt: string
  savedAt: string
}

export interface Label {
  name: string
}

export interface Highlight {
  quote: string
}

const endpoint = 'https://api-prod.omnivore.app/api/graphql'

export const loadArticle = async (
  slug: string,
  apiKey: string
): Promise<Article> => {
  const res = await fetch(endpoint, {
    headers: {
      'content-type': 'application/json',
      authorization: apiKey,
    },
    body: `{"query":"\\n  query GetArticle(\\n    $username: String!\\n    $slug: String!\\n  ) {\\n    article(username: $username, slug: $slug) {\\n      ... on ArticleSuccess {\\n        article {\\n          ...ArticleFields\\n          highlights {\\n            ...HighlightFields\\n          }\\n          labels {\\n            ...LabelFields\\n          }\\n        }\\n      }\\n      ... on ArticleError {\\n        errorCodes\\n      }\\n    }\\n  }\\n  \\n  fragment ArticleFields on Article {\\n    savedAt\\n  }\\n\\n  \\n  fragment HighlightFields on Highlight {\\n    quote\\n  }\\n\\n  \\n  fragment LabelFields on Label {\\n    name\\n  }\\n\\n","variables":{"username":"me","slug":"${slug}"}}`,
    method: 'POST',
  })
  const response = (await res.json()) as GetArticleResponse

  return response.data.article.article
}

export const loadArticles = async (
  apiKey: string,
  after = 0,
  first = 10,
  updatedAt = '',
  filter = ''
): Promise<[Article[], boolean]> => {
  const res = await fetch(endpoint, {
    headers: {
      'content-type': 'application/json',
      authorization: apiKey,
    },
    body: `{"query":"\\n    query Search($after: String, $first: Int, $query: String) {\\n      search(first: $first, after: $after, query: $query) {\\n        ... on SearchSuccess {\\n          edges {\\n            node {\\n              title\\n              slug\\n              url\\n              author\\n              updatedAt\\n              description\\n            }\\n          }\\n          pageInfo {\\n            hasNextPage\\n          }\\n        }\\n        ... on SearchError {\\n          errorCodes\\n        }\\n      }\\n    }\\n  ","variables":{"after":"${after}","first":${first}, "query":"${
      updatedAt ? 'updated:' + updatedAt : ''
    } sort:updated-asc ${filter}"}}`,
    method: 'POST',
  })

  const jsonRes = (await res.json()) as SearchResponse
  const articles = jsonRes.data.search.edges.map((e) => e.node)

  return [articles, jsonRes.data.search.pageInfo.hasNextPage]
}
