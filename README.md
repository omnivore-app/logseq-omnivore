# logseq-omnivore

This plugin imports your saved [Omnivore](https://omnivore.app/) articles and highlights into Logseq.

## Features

* Import your highlights and saved article
* Create graphs based on Omnivore data
* Filter imported data using Omnivores [advanced search syntax](https://docs.omnivore.app/using/search.html)
* Custom templates for imported data

## Installation

1. Install the plugin from the marketplace or build it from source and load unpacked plugin
2. Sign up for an [Omnivore account](https://omnivore.app)
3. Go to [Omnivore](https://omnivore.app/settings/api) and Create an API key
4. Open settings and add your api key

## Usage

1. The plugin will automatically sync with Omnivore every time you open the plugin and every time you change the settings
2. You can also manually sync with Omnivore by clicking the Omnivore icon on the toolbar
3. You can also change the API key, the search filter, and how often the plugin syncs with Omnivore by updating the settings
4. The plugin creates a new page named "Omnivore" and a block for each saved article including metadata, labels. Content you have highlighted in Omnivore, and any notes you added, will be nested
in the article block
5. Clicking on the article will open the Omnivore article in a new tab
6. We also create an internal link to each label in the article so you can group articles by label
7. Kudos to [@Brian](https://twitter.com/Bsunter) for the great [guide](https://briansunter.com/graph/#/page/omnivore-logseq-guide?anchor=ls-block-62b28de3-0e9e-456e-bf29-7e2541213aa5) on how to use Omnivore and the plugin. [Chinese translation](https://sywhb.github.io/#/page/omnivore-logseq%20指南) by [@吴洪博](https://twitter.com/Sy98715020)

## Demo

### Settings

![settings](screenshots/settings.gif)

### Fetching

![fetching](screenshots/fetching.gif)

## Contacts

Developer: [Hongbo Wu](https://github.com/sywhb) @ [Omnivore](https://github.com/omnivore-app)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## FAQ

### I got `TypeError: Cannot read properties of null (reading:’uuid’)` when trying to fetch articles.

This has been fixed in the latest version of the plugin. If you still encounter this issue, please try to click on the empty block on the "Omnivore" page.

### The button to sync with Omnivore is not working after updating settings.

This has been fixed in the latest version of the plugin. If you still encounter this issue, please try to reload the plugin and if it is still not working, please open on issue.
