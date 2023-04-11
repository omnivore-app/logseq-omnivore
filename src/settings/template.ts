import Mustache from 'mustache'
import { Article, Highlight, HighlightType, Label, PageType } from '../api'
import { dateReference, formatDate, siteNameFromUrl } from '../util'

export interface ArticleVariables {
  title: string
  author?: string
  omnivoreUrl: string
  siteName: string
  content: string
  originalUrl: string
  note?: string
  type: PageType
  labels?: Label[]
  highlights?: HighlightVariables[]
  dateSaved: string
  datePublished?: string
  dateRead?: string
  rawDatePublished?: string
  rawDateRead?: string
}

export interface HighlightVariables {
  text: string
  labels?: Label[]
  highlightUrl: string
  dateHighlighted: string
  rawDateHighlighted: string
}

export type TemplateVariables = ArticleVariables & HighlightVariables

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

export const defaultHighlightTemplate = `> {{{text}}} [⤴️]({{{highlightUrl}}}) {{#labels}} #[[{{{name}}}]] {{/labels}}`

const buildArticleVariables = (
  article: Article,
  preferredDateFormat: string
): ArticleVariables => {
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
  }
}

export const renderArticleContent = (
  template: string,
  article: Article,
  preferredDateFormat: string
): string => {
  const articleVariables = buildArticleVariables(article, preferredDateFormat)
  return Mustache.render(template, articleVariables)
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
  const articleVariables = buildArticleVariables(article, preferredDateFormat)
  const highlightVariables: TemplateVariables = {
    ...articleVariables,
    text: highlight.quote,
    labels: highlight.labels,
    highlightUrl: `https://omnivore.app/me/${article.slug}#${highlight.id}`,
    dateHighlighted,
    rawDateHighlighted,
  }
  return Mustache.render(template, highlightVariables)
}
