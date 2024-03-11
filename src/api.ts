import { Item, ItemFormat, Omnivore } from '@omnivore-app/api'

export const getOmnivoreItems = async (
  apiKey: string,
  after = 0,
  first = 10,
  updatedAt = '',
  query = '',
  includeContent = false,
  format: ItemFormat = 'html',
  baseUrl?: string
): Promise<[Item[], boolean]> => {
  const omnivore = new Omnivore({
    apiKey,
    baseUrl,
    timeoutMs: 10000,
  })

  const result = await omnivore.items.search({
    after,
    first,
    query: `${updatedAt ? 'updated:' + updatedAt : ''} sort:saved-asc ${query}`,
    includeContent,
    format,
  })

  const items = result.edges.map((e) => e.node)

  return [items, result.pageInfo.hasNextPage]
}

export const getDeletedOmnivoreItems = async (
  apiKey: string,
  after = 0,
  first = 10,
  updatedAt = '',
  baseUrl: string
): Promise<[Item[], boolean]> => {
  const omnivore = new Omnivore({
    apiKey,
    baseUrl,
    timeoutMs: 10000,
  })

  const result = await omnivore.items.updates({
    after,
    first,
    since: updatedAt || '2021-01-01',
  })

  const deletedItems = result.edges
    .filter((edge) => edge.updateReason === 'DELETED' && edge.node)
    .map((edge) => edge.node) as Item[]

  return [deletedItems, result.pageInfo.hasNextPage]
}
