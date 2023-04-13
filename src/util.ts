import { format } from 'date-fns'
import { diff_match_patch } from 'diff-match-patch'
import { DateTime } from 'luxon'
import escape from 'markdown-escape'
import { Highlight } from './api'

export interface HighlightPoint {
  left: number
  top: number
}

export const DATE_FORMAT_W_OUT_SECONDS = "yyyy-MM-dd'T'HH:mm"
export const DATE_FORMAT = `${DATE_FORMAT_W_OUT_SECONDS}:ss`

export const getHighlightLocation = (patch: string): number => {
  const dmp = new diff_match_patch()
  const patches = dmp.patch_fromText(patch)
  return patches[0].start1 || 0
}

export const getHighlightPoint = (patch: string): HighlightPoint => {
  const { bbox } = JSON.parse(patch) as { bbox: number[] }
  if (!bbox || bbox.length !== 4) {
    return { left: 0, top: 0 }
  }
  return { left: bbox[0], top: bbox[1] }
}

export const compareHighlightsInFile = (a: Highlight, b: Highlight): number => {
  // get the position of the highlight in the file
  const highlightPointA = getHighlightPoint(a.patch)
  const highlightPointB = getHighlightPoint(b.patch)
  if (highlightPointA.top === highlightPointB.top) {
    // if top is same, sort by left
    return highlightPointA.left - highlightPointB.left
  }
  // sort by top
  return highlightPointA.top - highlightPointB.top
}

export const markdownEscape = (text: string): string => {
  try {
    return escape(text)
  } catch (e) {
    console.error('markdownEscape error', e)
    return text
  }
}

export const escapeQuotationMarks = (text: string): string => {
  return text.replace(/"/g, '\\"')
}

export const parseDateTime = (str: string): DateTime => {
  const res = DateTime.fromFormat(str, DATE_FORMAT)
  if (res.isValid) {
    return res
  }
  return DateTime.fromFormat(str, DATE_FORMAT_W_OUT_SECONDS)
}

export const formatDate = (date: Date, preferredDateFormat: string): string => {
  return format(date, preferredDateFormat, {
    // YY and YYYY represent the local week-numbering year (44, 01, 00, 17)
    // are often confused with yy and yyyy that represent the calendar year
    // Here, we accept tokens YY and DD
    useAdditionalDayOfYearTokens: true,
    useAdditionalWeekYearTokens: true,
  })
}

export const dateReference = (
  date: Date,
  preferredDateFormat: string
): string => {
  return `[[${formatDate(date, preferredDateFormat)}]]`
}

export const siteNameFromUrl = (originalArticleUrl: string): string => {
  try {
    return new URL(originalArticleUrl).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export const delay = (t = 100) => new Promise((r) => setTimeout(r, t))

export const formatHighlightQuote = (
  quote: string,
  template: string
): string => {
  if (template.startsWith('>')) {
    // replace all empty lines with blockquote '>' to preserve paragraphs
    quote = quote.replace(/^(?=\n)$|^\s*?\n/gm, '> ')
  }

  return quote
}
