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

export enum UpdateReason {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
}

export interface UpdatesSinceResponse {
  data: {
    updatesSince: {
      edges: { updateReason: UpdateReason; node: { slug: string } }[]
      pageInfo: {
        hasNextPage: boolean
      }
    }
  }
}

export enum PageType {
  Article = 'ARTICLE',
  Book = 'BOOK',
  File = 'FILE',
  Profile = 'PROFILE',
  Unknown = 'UNKNOWN',
  Website = 'WEBSITE',
  Highlights = 'HIGHLIGHTS',
}

export interface Article {
  title: string
  siteName?: string
  originalArticleUrl: string
  author?: string
  description?: string
  slug: string
  labels?: Label[]
  highlights?: Highlight[]
  updatedAt: string
  savedAt: string
  pageType: PageType
  content: string
  publishedAt?: string
  readAt?: string
}

export interface Label {
  name: string
}

export enum HighlightType {
  Highlight = 'HIGHLIGHT',
  Note = 'NOTE',
  Redaction = 'REDACTION',
}

export interface Highlight {
  id: string
  quote: string
  annotation: string
  patch: string
  updatedAt: string
  labels?: Label[]
  type: HighlightType
  highlightPositionPercent?: number
}

const ENDPOINT = 'https://api-prod.omnivore.app/api/graphql'
const requestHeaders = (apiKey: string) => ({
  'Content-Type': 'application/json',
  authorization: apiKey,
  'X-OmnivoreClient': 'logseq-plugin',
})

export const loadArticles = async (
  apiKey: string,
  after = 0,
  first = 10,
  updatedAt = '',
  query = '',
  includeContent = false,
  format = 'html',
  endpoint = ENDPOINT
): Promise<[Article[], boolean]> => {
  const res = await fetch(endpoint, {
    headers: requestHeaders(apiKey),
    body: JSON.stringify({
      query: `
        query Search($after: String, $first: Int, $query: String, $includeContent: Boolean, $format: String) {
          search(first: $first, after: $after, query: $query, includeContent: $includeContent, format: $format) {
            ... on SearchSuccess {
              edges {
                node {
                  title
                  slug
                  siteName
                  originalArticleUrl
                  url
                  author
                  updatedAt
                  description
                  savedAt
                  pageType
                  content
                  publishedAt
                  readAt
                  highlights {
                    id
                    quote
                    annotation
                    patch
                    updatedAt
                    highlightPositionPercent
                    labels {
                      name
                    }
                    type
                  }
                  labels {
                    name
                  }
                }
              }
              pageInfo {
                hasNextPage
              }
            }
            ... on SearchError {
              errorCodes
            }
          }
        }`,
      variables: {
        after: `${after}`,
        first,
        query: `${
          updatedAt ? 'updated:' + updatedAt : ''
        } sort:saved-asc ${query}`,
        includeContent,
        format,
      },
    }),
    method: 'POST',
  })

  const jsonRes = (await res.json()) as SearchResponse
  const articles = jsonRes.data.search.edges.map((e) => e.node)

  return [articles, jsonRes.data.search.pageInfo.hasNextPage]
}

export const loadDeletedArticleSlugs = async (
  apiKey: string,
  after = 0,
  first = 10,
  updatedAt = '',
  endpoint = ENDPOINT
): Promise<[string[], boolean]> => {
  const res = await fetch(endpoint, {
    headers: requestHeaders(apiKey),
    body: JSON.stringify({
      query: `
        query UpdatesSince($after: String, $first: Int, $since: Date!) {
          updatesSince(first: $first, after: $after, since: $since) {
            ... on UpdatesSinceSuccess {
              edges {
                updateReason
                node {
                  slug
                }
              }
              pageInfo {
                hasNextPage
              }
            }
            ... on UpdatesSinceError {
              errorCodes
            }
          }
        }`,
      variables: {
        after: `${after}`,
        first,
        since: updatedAt || '2021-01-01',
      },
    }),
    method: 'POST',
  })

  const jsonRes = (await res.json()) as UpdatesSinceResponse
  const deletedArticleSlugs = jsonRes.data.updatesSince.edges
    .filter((edge) => edge.updateReason === UpdateReason.DELETED)
    .map((edge) => edge.node.slug)

  return [deletedArticleSlugs, jsonRes.data.updatesSince.pageInfo.hasNextPage]
}
