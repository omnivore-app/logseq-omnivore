import { Highlight, Item, ItemType, Label } from '@omnivore-app/api'
import { truncate } from 'lodash'
import Mustache from 'mustache'
import {
  dateReference,
  formatDate,
  formatHighlightQuote,
  siteNameFromUrl,
} from '../util'

type FunctionMap = {
  [key: string]: () => (
    text: string,
    render: (text: string) => string
  ) => string
}

export type ItemView =
  | {
      id: string
      title: string
      author?: string
      omnivoreUrl: string
      siteName: string
      originalUrl: string
      note?: string
      type: ItemType
      labels?: Label[]
      dateSaved: string
      datePublished?: string
      dateRead?: string
      rawDatePublished?: string
      rawDateRead?: string
      state: string
      wordsCount?: number
      readLength?: number
      dateArchived?: string
    }
  | FunctionMap

export type HighlightView =
  | {
      text: string
      labels?: Label[]
      highlightUrl: string
      dateHighlighted: string
      rawDateHighlighted: string
      note?: string
      color: string
      positionPercent: number
      positionAnchorIndex: number
    }
  | FunctionMap

enum ItemState {
  Saved = 'SAVED',
  Reading = 'READING',
  Completed = 'COMPLETED',
  Archived = 'ARCHIVED',
}

export const defaultItemTemplate = `[{{{title}}}]({{{omnivoreUrl}}})
collapsed:: true
site:: {{#siteName}}[{{{siteName}}}]{{/siteName}}({{{originalUrl}}})
{{#author}}
author:: {{{author}}}
{{/author}}
{{#labels.length}}
labels:: {{#labels}}[[{{{name}}}]] {{/labels}}
{{/labels.length}}
date-saved:: {{{dateSaved}}}
{{#datePublished}}
date-published:: {{{datePublished}}}
{{/datePublished}}`

export const defaultHighlightTemplate = `> {{{text}}} [⤴️]({{{highlightUrl}}}) {{#labels}} #[[{{{name}}}]] {{/labels}}

{{#note.length}}note:: {{{note}}}{{/note.length}}`

const getItemState = (item: Item): string => {
  if (item.isArchived) {
    return ItemState.Archived
  }
  if (item.readingProgressPercent > 0) {
    return item.readingProgressPercent === 100
      ? ItemState.Completed
      : ItemState.Reading
  }

  return ItemState.Saved
}

function lowerCase() {
  return function (text: string, render: (text: string) => string) {
    return render(text).toLowerCase()
  }
}

function upperCase() {
  return function (text: string, render: (text: string) => string) {
    return render(text).toUpperCase()
  }
}

function upperCaseFirst() {
  return function (text: string, render: (text: string) => string) {
    const str = render(text)
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }
}

const functionMap: FunctionMap = {
  lowerCase,
  upperCase,
  upperCaseFirst,
}

const createItemView = (item: Item, preferredDateFormat: string): ItemView => {
  const siteName =
    item.siteName || siteNameFromUrl(item.originalArticleUrl || item.url)
  const dateSaved = dateReference(new Date(item.savedAt), preferredDateFormat)
  const datePublished = item.publishedAt
    ? dateReference(new Date(item.publishedAt), preferredDateFormat)
    : undefined
  const note = item.highlights?.find((h) => h.type === 'NOTE')
  const rawDatePublished = item.publishedAt
    ? formatDate(new Date(item.publishedAt), preferredDateFormat)
    : undefined
  const rawDateRead = item.readAt
    ? formatDate(new Date(item.readAt), preferredDateFormat)
    : undefined
  const dateRead = item.readAt
    ? dateReference(new Date(item.readAt), preferredDateFormat)
    : undefined
  const wordsCount = item.wordsCount
  const readLength = wordsCount
    ? Math.round(Math.max(1, wordsCount / 235))
    : undefined
  const dateArchived = item.archivedAt
    ? formatDate(new Date(item.archivedAt), preferredDateFormat)
    : undefined
  return {
    id: item.id,
    title: item.title,
    omnivoreUrl: `https://omnivore.app/me/${item.slug}`,
    siteName,
    originalUrl: item.originalArticleUrl || '',
    author: item.author || 'unknown',
    labels: item.labels || [],
    dateSaved,
    datePublished,
    note: note?.annotation ?? undefined,
    type: item.pageType,
    rawDatePublished,
    rawDateRead,
    dateRead,
    state: getItemState(item),
    wordsCount: item.wordsCount || 0,
    readLength,
    dateArchived,
    ...functionMap,
  }
}

export const renderItem = (
  template: string,
  item: Item,
  preferredDateFormat: string
): string => {
  const articleView = createItemView(item, preferredDateFormat)
  return Mustache.render(template, articleView)
}

export const renderHighlightContent = (
  template: string,
  highlight: Highlight,
  item: Item,
  preferredDateFormat: string
): string => {
  const updatedAt = new Date(highlight.updatedAt || '')
  const dateHighlighted = dateReference(updatedAt, preferredDateFormat)
  const rawDateHighlighted = formatDate(updatedAt, preferredDateFormat)
  const highlightView: HighlightView = {
    text: formatHighlightQuote(highlight.quote, template),
    labels: highlight.labels || [],
    highlightUrl: `https://omnivore.app/me/${item.slug}#${highlight.id}`,
    dateHighlighted,
    rawDateHighlighted,
    note: highlight.annotation ?? undefined,
    color: highlight.color ?? 'yellow',
    positionPercent: highlight.highlightPositionPercent || 0,
    positionAnchorIndex: (highlight.highlightPositionAnchorIndex || 0) + 1,
    ...functionMap,
  }
  return Mustache.render(template, highlightView)
}

export const renderPageName = (
  item: Item,
  pageName: string,
  preferredDateFormat: string
) => {
  const date = formatDate(new Date(item.savedAt), preferredDateFormat)
  // replace slash with dash in the title to prevent creating subpages
  // since there is no way to escape slashes in logseq
  const title = item.title.replace(/\//g, '-')

  const renderedPageName = Mustache.render(pageName, {
    title,
    date,
    currentDate: formatDate(new Date(), preferredDateFormat),
  })

  // truncate the page name to 100 characters
  return truncate(renderedPageName, {
    length: 100,
  })
}

export const preParseTemplate = (template: string) => {
  Mustache.parse(template)
}
