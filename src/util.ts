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

export const getHighlightLocation = (patch: string | null): number => {
  if (!patch) {
    return 0
  }
  const dmp = new diff_match_patch()
  const patches = dmp.patch_fromText(patch)
  return patches[0].start1 || 0
}

export const getHighlightPoint = (patch: string | null): HighlightPoint => {
  if (!patch) {
    return { left: 0, top: 0 }
  }
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
  quote: string | null,
  template: string
): string => {
  if (!quote) {
    return ''
  }

  if (template.startsWith('>')) {
    // replace all empty lines with blockquote '>' to preserve paragraphs
    quote = quote.replace(/^(?=\n)$|^\s*?\n/gm, '> ')
  }

  return quote
}

export const parseBlockProperties = (
  content: string
): Record<string, unknown> | undefined => {
  // block properties are stored as key:: value or key::value
  // e.g. "status:: completed" or "status::completed" becomes { status: 'completed' }
  const blockProperties = content.matchAll(/(.*)::\s*(.*)/g)
  const blockPropertiesObj: Record<string, unknown> = {}
  for (const match of blockProperties) {
    const [, key, value] = match
    // convert to array for block references
    // e.g. "labels:: [[label1]][[label2]]" becomes { labels: ['label1', 'label2'] }
    const valueArray = Array.from(value.matchAll(/\[\[(.*?)\]\]/g), (m) => m[1])
    if (valueArray.length > 0) {
      blockPropertiesObj[key] = valueArray
      continue
    }

    blockPropertiesObj[key] = value
  }
  return Object.keys(blockPropertiesObj).length > 0
    ? blockPropertiesObj
    : undefined
}

export const isBlockPropertiesChanged = (
  newBlockProperties?: Record<string, unknown>,
  existingBlockProperties?: Record<string, unknown>
): boolean => {
  if (!newBlockProperties) {
    return false
  }

  if (!existingBlockProperties) {
    return true
  }

  // do a shallow comparison of the two blocks
  return Object.keys(newBlockProperties).some((key) => {
    // skip collapsed property
    if (key === 'collapsed') {
      return false
    }
    // if the key doesn't exist in the existing block, it's a new property
    if (!Object.prototype.hasOwnProperty.call(existingBlockProperties, key)) {
      return true
    }
    const newBlockProperty = newBlockProperties[key]
    const existingBlockProperty = existingBlockProperties[key]
    // convert an array of values to a string
    if (Array.isArray(newBlockProperty)) {
      if (!Array.isArray(existingBlockProperty)) {
        return true
      }

      return newBlockProperty.join(',') !== existingBlockProperty.join(',')
    }

    return newBlockProperty != existingBlockProperty
  })
}

export const escapeQuotes = (str: string): string => {
  return str.replace(/"/g, '\\"')
}
