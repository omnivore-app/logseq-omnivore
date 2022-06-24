import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin'

export const settingSchema: SettingSchemaDesc[] = [
  {
    key: 'api key',
    type: 'string',
    title: 'Enter Omnivore Api Key',
    description: 'Enter Omnivore Api Key here',
    default: '',
  },
  {
    key: 'username',
    type: 'string',
    title: 'Enter Omnivore username',
    description: 'Enter Omnivore username here',
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
]
