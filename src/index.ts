import '@logseq/libs'
import * as icon from './images/icon.png'
import { LSPluginBaseInfo } from '@logseq/libs/dist/LSPlugin'
import { settingSchema } from './settingSchema'
import { fetchArtifacts } from './fetchArtifacts'
import { delay } from './util'

/**
 * main entry
 * @param baseInfo
 */
const main = async (baseInfo: LSPluginBaseInfo) => {
  console.log('logseq-omnivore loaded')

  logseq.useSettingsSchema(settingSchema)

  let apiKey = logseq.settings?.['api key'] as string
  let username = logseq.settings?.['username'] as string
  let frequency = logseq.settings?.frequency as number
  let isLoading = false

  logseq.onSettingsChanged(() => {
    apiKey = logseq.settings?.['api key'] as string
    username = logseq.settings?.['username'] as string
    frequency = logseq.settings?.frequency as number
  })

  logseq.provideModel({
    async loadOmnivore() {
      await fetchArtifacts(apiKey, username)
    },
  })

  logseq.App.registerUIItem('toolbar', {
    key: 'logseq-omnivore',
    template: `
      <a data-on-click="loadOmnivore" class="button" style="width:3rem;height:3rem;">
        <img src="${icon as string}">
      </a>
    `,
  })

  logseq.provideStyle(`
    [data-injected-ui=logseq-omnivore-${baseInfo.id}] {
      display: flex;
      align-items: center;
    }
  `)

  // Call fetchArtifacts on a loop with delay
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (!isLoading) {
      isLoading = true
      await fetchArtifacts(apiKey, username, true)
      isLoading = false
    }
    await delay(frequency * 60 * 1000)
  }
}

// bootstrap
logseq.ready(main).catch(console.error)
