import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'
import { t } from 'logseq-l10n'
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
  headingBlockTitle: string
  syncContent: boolean
}

export const getQueryFromFilter = (
  filter: Filter,
  customQuery: string
): string => {
  switch (filter) {
    case Filter.ALL:
      return 'in:all'
    case Filter.HIGHLIGHTS:
      return `has:highlights in:all`
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
    title: t('General Settings'),
    default: '',
    description: '',
  },
  {
    key: 'apiKey',
    type: 'string',
    title: t('Enter your Omnivore Api Key'),
    description: t('Create an API key at https://omnivore.app/settings/api'),
    default: '',
  },
  {
    key: 'filter',
    type: 'enum',
    title: t('Select an Omnivore search filter type'),
    description: t('All articles or just highlights'),
    default: Filter.HIGHLIGHTS.toString(),
    enumPicker: 'select',
    enumChoices: Object.values(Filter),
  },
  {
    key: 'customQuery',
    type: 'string',
    title: t(
      'Enter an Omnivore custom search query if advanced filter is selected'
    ),
    description: t(
      'See https://docs.omnivore.app/using/search.html for more info on search query syntax'
    ),
    default: '',
  },
  {
    key: 'highlightOrder',
    type: 'enum',
    title: t('Order of Highlights'),
    description: t('Select a way to sort new highlights in your articles'),
    default: HighlightOrder.TIME.toString(),
    enumPicker: 'select',
    enumChoices: Object.values(HighlightOrder),
  },
  {
    key: 'isSinglePage',
    type: 'boolean',
    title: t('Sync to a single page'),
    description: t(
      'Sync all articles to a single page. If this is not selected, each article will be synced to a separate page.'
    ),
    default: true,
  },
  {
    key: 'createTemplate',
    type: 'heading',
    title: t('Article Template'),
    default: '',
    description: t(
      'If the above item is off, want to sync to a separate page for each article, use the variable `{{id}}`, `{{{title}}}`, `{{{date}}}` or `{{{currentDate}}}` as the page name. For example, `{{{title}}}` will create a page for each article with the title of the article.'
    ),
  },
  {
    key: 'createTemplateDesc',
    type: 'heading',
    title: '',
    default: '',
    description: t(
      '[> Refer to this doc for more info](https://docs.omnivore.app/integrations/logseq.html#controlling-the-layout-of-the-data-imported-to-logseq) [> Variables available could be found here](https://docs.omnivore.app/integrations/logseq.html#variables-available-to-the-highlight-template)'
    ),
  },
  {
    key: 'articleTemplate',
    type: 'string',
    title: t('Enter the template to use for new articles'),
    description: t('The template to use for new articles.'),
    default: defaultArticleTemplate,
    inputAs: 'textarea',
  },
  {
    key: 'highlightTemplate',
    type: 'string',
    title: t('Enter the template to use for new highlights'),
    description: t('The template to use for new highlights.'),
    default: defaultHighlightTemplate,
    inputAs: 'textarea',
  },
  {
    key: 'syncContent',
    type: 'boolean',
    title: t('Sync article content'),
    description: t(
      'Sync article content into the content block. If this is not selected, only highlights will be synced.'
    ),
    default: false,
  },
  {
    key: 'advancedSettings',
    type: 'heading',
    title: t('Advanced Settings'),
    default: '',
    description: '',
  },
  {
    key: 'frequency',
    type: 'number',
    title: t('Enter sync with Omnivore frequency'),
    description: t('In minutes here or 0 to disable'),
    default: 60,
  },
  {
    key: 'syncAt',
    type: 'string',
    title: t('Last Sync'),
    description: t(
      'The last time Omnivore was synced. Clear this value to completely refresh the sync.'
    ),
    default: '',
    inputAs: 'datetime-local',
  },
  {
    key: 'graph',
    type: 'string',
    title: t('Enter the graph to sync Omnivore articles to'),
    description: '',
    // default is the current graph
    default: (await logseq.App.getCurrentGraph())?.name as string,
  },
  {
    key: 'pageName',
    type: 'string',
    title: t('Enter the page name to sync with Omnivore'),
    description: t('This page will be created if it does not exist.'),
    default: 'Omnivore',
  },
  {
    key: 'headingBlockTitle',
    type: 'string',
    title: t(
      'Enter the title of the heading block to place synced articles under'
    ),
    description: t(
      'This heading block will be created if it does not exist. Default is "## 🔖 Articles". Leave blank to not create a heading block.'
    ),
    default: '## 🔖 Articles',
  },
  {
    key: 'endpoint',
    type: 'string',
    title: t('API Endpoint'),
    description: t(
      "Enter the Omnivore server's API endpoint here (default: https://api-prod.omnivore.app/api/graphql )"
    ),
    default: 'https://api-prod.omnivore.app/api/graphql',
  },
]
