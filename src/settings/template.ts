import Mustache from 'mustache'
import { Article, Highlight, HighlightType, Label, PageType } from '../api'
import {
  dateReference,
  formatDate,
  formatHighlightQuote,
  siteNameFromUrl,
} from '../util'

export interface ArticleView {
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
}

export interface HighlightView {
  text: string
  labels?: Label[]
  highlightUrl: string
  dateHighlighted: string
  rawDateHighlighted: string
  note?: string
}

enum ArticleState {
  Saved = 'SAVED',
  Reading = 'READING',
  Read = 'READ',
  Archived = 'ARCHIVED',
}

export const defaultArticleTemplate = `[{{{title}}}]({{{omnivoreUrl}}})
collapsed:: true
site:: {{#siteName}}[{{{siteName}}}]{{/siteName}}({{{originalUrl}}})
{{#author}}
author:: {{{author}}}
{{/author}}
{{#labels.length}}
labels:: {{#labels}}[[{{{name}}}]]{{/labels}}
{{/labels.length}}
date-saved:: {{{dateSaved}}}
{{#datePublished}}
date-published:: {{{datePublished}}}
{{/datePublished}}`

export const defaultHighlightTemplate = `> {{{text}}} [⤴️]({{{highlightUrl}}}) {{#labels}} #[[{{{name}}}]] {{/labels}}

note:: {{{note}}}
`

const getArticleState = (article: Article): string => {
  if (article.isArchived) {
    return ArticleState.Archived
  }
  if (article.readingProgressPercent > 0) {
    return article.readingProgressPercent === 100
      ? ArticleState.Read
      : ArticleState.Reading
  }

  return ArticleState.Saved
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
    note: note?.annotation,
    type: article.pageType,
    rawDatePublished,
    rawDateRead,
    dateRead,
    state: getArticleState(article),
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
    note: highlight.annotation,
  }
  return Mustache.render(template, highlightView)
}

export const renderPageName = (
  article: Article,
  pageName: string,
  preferredDateFormat: string
) => {
  const date = formatDate(new Date(article.savedAt), preferredDateFormat)
  return Mustache.render(pageName, {
    title: article.title,
    date,
  })
}

export const preParseTemplate = (template: string) => {
  Mustache.parse(template)
}
