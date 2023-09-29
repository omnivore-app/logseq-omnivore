import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'
import { defaultArticleTemplate, defaultHighlightTemplate } from './template'

export enum Filter {
  ALL = 'import all my articles',
  HIGHLIGHTS = 'import just highlights',
  ADVANCED = 'advanced',
}

export enum HighlightOrder {
  LOCATION = 'the location of highlights in the article',
  TIME = 'the time that highlights are updated',
}

export interface Settings {
  apiKey: string
  filter: Filter
  syncAt: string
  frequency: number
  graph: string
  customQuery: string
  disabled: boolean
  highlightOrder: HighlightOrder
  pageName: string
  articleTemplate: string
  highlightTemplate: string
  loading: boolean
  syncJobId: number
  endpoint: string
  isSinglePage: boolean
  version: string
}

export const getQueryFromFilter = (
  filter: Filter,
  customQuery: string
): string => {
  switch (filter) {
    case Filter.ALL:
      return ''
    case Filter.HIGHLIGHTS:
      return `has:highlights`
    case Filter.ADVANCED:
      return customQuery
    default:
      return ''
  }
}

export const settingsSchema = async (): Promise<SettingSchemaDesc[]> => [
  {
    key: 'generalSettings',
    type: 'heading',
    title: 'General Settings',
    default: '',
    description: '',
  },
  {
    key: 'apiKey',
    type: 'string',
    title: 'Enter your Omnivore Api Key',
    description:
      'You can create an API key at https://omnivore.app/settings/api',
    default: '',
  },
  {
    key: 'filter',
    type: 'enum',
    title: 'Select an Omnivore search filter type',
    description: 'Select an Omnivore search filter type',
    default: Filter.HIGHLIGHTS.toString(),
    enumPicker: 'select',
    enumChoices: Object.values(Filter),
  },
  {
    key: 'customQuery',
    type: 'string',
    title:
      'Enter an Omnivore custom search query if advanced filter is selected',
    description:
      'See https://docs.omnivore.app/using/search.html for more info on search query syntax',
    default: '',
  },
  {
    key: 'frequency',
    type: 'number',
    title: 'Enter sync with Omnivore frequency',
    description:
      'Enter sync with Omnivore frequency in minutes here or 0 to disable',
    default: 60,
  },
  {
    key: 'graph',
    type: 'string',
    title: 'Enter the graph to sync with Omnivore',
    description: 'Enter the graph to sync Omnivore articles to',
    // default is the current graph
    default: (await logseq.App.getCurrentGraph())?.name as string,
  },
  {
    key: 'syncAt',
    type: 'string',
    title: 'Last Sync',
    description:
      'The last time Omnivore was synced. Clear this value to completely refresh the sync.',
    default: '',
    inputAs: 'datetime-local',
  },
  {
    key: 'highlightOrder',
    type: 'enum',
    title: 'Order of Highlights',
    description: 'Select a way to sort new highlights in your articles',
    default: HighlightOrder.TIME.toString(),
    enumPicker: 'select',
    enumChoices: Object.values(HighlightOrder),
  },
  {
    key: 'isSinglePage',
    type: 'boolean',
    title: 'Sync to a single page',
    description:
      'Sync all articles to a single page. If this is not selected, each article will be synced to a separate page.',
    default: true,
  },
  {
    key: 'pageName',
    type: 'string',
    title: 'Enter the page name to sync with Omnivore',
    description:
      'Enter the page name to sync Omnivore articles into. This page will be created if it does not exist. If you isSinglePage is off and you want to sync to a separate page for each article, use the variable {{{title}}}, {{{date}}} or {{{currentDate}}} as the page name. For example, {{{title}}} will create a page for each article with the title of the article.',
    default: 'Omnivore',
  },
  {
    key: 'articleTemplate',
    type: 'string',
    title: 'Enter the template to use for new articles',
    description:
      'The template to use for new articles. Refer to this doc for more info: https://docs.omnivore.app/integrations/logseq.html#controlling-the-layout-of-the-data-imported-to-logseq Variables available could be found here: https://docs.omnivore.app/integrations/logseq.html#variables-available-to-the-highlight-template',
    default: defaultArticleTemplate,
    inputAs: 'textarea',
  },
  {
    key: 'highlightTemplate',
    type: 'string',
    title: 'Enter the template to use for new highlights',
    description:
      'The template to use for new highlights. Refer to this doc for more info: https://docs.omnivore.app/integrations/logseq.html#controlling-the-layout-of-the-data-imported-to-logseq Variables available could be found here: https://docs.omnivore.app/integrations/logseq.html#variables-available-to-the-highlight-template',
    default: defaultHighlightTemplate,
    inputAs: 'textarea',
  },
  {
    key: 'advancedSettings',
    type: 'heading',
    title: 'Advanced Settings',
    default: '',
    description: '',
  },
  {
    key: 'endpoint',
    type: 'string',
    title: 'API Endpoint',
    description: "Enter the Omnivore server's API endpoint",
    default: 'https://api-prod.omnivore.app/api/graphql',
  },
]
