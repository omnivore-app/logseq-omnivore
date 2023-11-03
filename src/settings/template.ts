import { truncate } from 'lodash'
import Mustache from 'mustache'
import { Article, Highlight, HighlightType, Label, PageType } from '../api'
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

export type ArticleView =
  | {
      title: string
      author?: string
      omnivoreUrl: string
      siteName: string
      content: string
      originalUrl: string
      note?: string
      type: PageType
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

enum ArticleState {
  Saved = 'SAVED',
  Reading = 'READING',
  Completed = 'COMPLETED',
  Archived = 'ARCHIVED',
}

export const defaultArticleTemplate = `[{{{title}}}]({{{omnivoreUrl}}})
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

const getArticleState = (article: Article): string => {
  if (article.isArchived) {
    return ArticleState.Archived
  }
  if (article.readingProgressPercent > 0) {
    return article.readingProgressPercent === 100
      ? ArticleState.Completed
      : ArticleState.Reading
  }

  return ArticleState.Saved
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

const createArticleView = (
  article: Article,
  preferredDateFormat: string
): ArticleView => {
  const siteName =
    article.siteName || siteNameFromUrl(article.originalArticleUrl)
  const dateSaved = dateReference(
    new Date(article.savedAt),
    preferredDateFormat
  )
  const datePublished = article.publishedAt
    ? dateReference(new Date(article.publishedAt), preferredDateFormat)
    : undefined
  const note = article.highlights?.find((h) => h.type === HighlightType.Note)
  const rawDatePublished = article.publishedAt
    ? formatDate(new Date(article.publishedAt), preferredDateFormat)
    : undefined
  const rawDateRead = article.readAt
    ? formatDate(new Date(article.readAt), preferredDateFormat)
    : undefined
  const dateRead = article.readAt
    ? dateReference(new Date(article.readAt), preferredDateFormat)
    : undefined
  const wordsCount = article.wordsCount
  const readLength = wordsCount
    ? Math.round(Math.max(1, wordsCount / 235))
    : undefined
  const dateArchived = article.archivedAt
    ? formatDate(new Date(article.archivedAt), preferredDateFormat)
    : undefined
  return {
    title: article.title,
    omnivoreUrl: `https://omnivore.app/me/${article.slug}`,
    siteName,
    originalUrl: article.originalArticleUrl,
    author: article.author,
    labels: article.labels,
    dateSaved,
    content: article.content,
    datePublished,
    note: note?.annotation ?? undefined,
    type: article.pageType,
    rawDatePublished,
    rawDateRead,
    dateRead,
    state: getArticleState(article),
    wordsCount,
    readLength,
    dateArchived,
    ...functionMap,
  }
}

export const renderArticleContent = (
  template: string,
  article: Article,
  preferredDateFormat: string
): string => {
  const articleView = createArticleView(article, preferredDateFormat)
  return Mustache.render(template, articleView)
}

export const renderHighlightContent = (
  template: string,
  highlight: Highlight,
  article: Article,
  preferredDateFormat: string
): string => {
  const updatedAt = new Date(highlight.updatedAt)
  const dateHighlighted = dateReference(updatedAt, preferredDateFormat)
  const rawDateHighlighted = formatDate(updatedAt, preferredDateFormat)
  const highlightView: HighlightView = {
    text: formatHighlightQuote(highlight.quote, template),
    labels: highlight.labels,
    highlightUrl: `https://omnivore.app/me/${article.slug}#${highlight.id}`,
    dateHighlighted,
    rawDateHighlighted,
    note: highlight.annotation ?? undefined,
    color: highlight.color ?? 'yellow',
    positionPercent: highlight.highlightPositionPercent,
    positionAnchorIndex: highlight.highlightPositionAnchorIndex,
    ...functionMap,
  }
  return Mustache.render(template, highlightView)
}

export const renderPageName = (
  article: Article,
  pageName: string,
  preferredDateFormat: string
) => {
  const date = formatDate(new Date(article.savedAt), preferredDateFormat)
  // replace slash with dash in the title to prevent creating subpages
  // since there is no way to escape slashes in logseq
  const title = article.title.replace(/\//g, '-')

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
