import { Omnivore } from '@omnivore-app/api'

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
      edges: { updateReason: UpdateReason; node: Article }[]
      pageInfo: {
        hasNextPage: boolean
      }
    }
  }
}

export type PageType =
  | 'ARTICLE'
  | 'BOOK'
  | 'FILE'
  | 'PROFILE'
  | 'UNKNOWN'
  | 'WEBSITE'
  | 'TWEET'
  | 'VIDEO'
  | 'IMAGE'
  | 'HIGHLIGHTS'

export interface Article {
  id: string
  title: string
  siteName?: string | null
  originalArticleUrl: string | null
  author?: string | null
  description?: string | null
  slug: string
  labels: Label[] | null
  highlights: Highlight[] | null
  updatedAt: string | null
  savedAt: string
  pageType: PageType
  content?: string | null
  publishedAt?: string | null
  readAt?: string | null
  readingProgressPercent: number
  isArchived: boolean
  wordsCount?: number | null
  archivedAt?: string | null
}

export interface Label {
  name: string
}

export type HighlightType = 'HIGHLIGHT' | 'NOTE' | 'REDACTION'

export interface Highlight {
  id: string
  quote: string | null
  annotation: string | null
  patch: string | null
  updatedAt: string | null
  labels?: Label[] | null
  type: HighlightType
  highlightPositionPercent: number | null
  color?: string | null
  highlightPositionAnchorIndex: number | null
}

const ENDPOINT = 'https://api-prod.omnivore.app/api/graphql'
const requestHeaders = (apiKey: string) => ({
  'Content-Type': 'application/json',
  authorization: apiKey,
  'X-OmnivoreClient': 'logseq-plugin',
})

export const getOmnivoreArticles = async (
  apiKey: string,
  after = 0,
  first = 10,
  updatedAt = '',
  query = '',
  includeContent = false,
  format = 'html',
  endpoint = ENDPOINT
): Promise<[Article[], boolean]> => {
  const omnivore = new Omnivore({
    authToken: apiKey,
    baseUrl: endpoint,
    timeoutMs: 10000,
  })

  const result = await omnivore.items.search({
    after: after.toString(),
    first,
    query: `${updatedAt ? 'updated:' + updatedAt : ''} sort:saved-asc ${query}`,
    includeContent,
    format: format as 'html' | 'markdown',
  })

  const items = result.edges.map((e) => e.node)

  return [items, result.pageInfo.hasNextPage]
}

export const getDeletedOmnivoreArticles = async (
  apiKey: string,
  after = 0,
  first = 10,
  updatedAt = '',
  endpoint = ENDPOINT
): Promise<[Article[], boolean]> => {
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
                  id
                  slug
                  title
                  savedAt
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
  const deletedArticles = jsonRes.data.updatesSince.edges
    .filter((edge) => edge.updateReason === UpdateReason.DELETED)
    .map((edge) => edge.node)

  return [deletedArticles, jsonRes.data.updatesSince.pageInfo.hasNextPage]
}
