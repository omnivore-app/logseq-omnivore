[日本語](https://github.com/omnivore-app/logseq-omnivore/blob/develop/README.ja.md)

# logseq-omnivore

This plugin enables importing and syncing web clippings, articles, and highlights from the web app [Omnivore.app](https://omnivore.app/) (its server) into a Logseq graph.

## Utilizing "Omnivore.app"

1. Register for an account on [Omnivore.app](https://omnivore.app).
   - "Omnivore.app" functions as a web tool (web app) specifically designed for web clippings. Instead of simply bookmarking interesting pages in a browser, users can manage them as web clippings, alongside highlights, and organize multiple sites.
      - This application is available for free on both desktop and mobile devices, and web clipping data is stored on the server (cloud). With this plugin, one can import and save this data in Logseq. Additionally, any attached notes related to the articles can also be imported.

### Showcase

* Sorted by Date: In Logseq, web clippings and highlights are automatically categorized based on their respective dates.
* Tagging and Referencing: Labels attached to web clippings act as tags with links, allowing users to associate web-clipped pages and their highlights with existing pages (displayed in the "Linked References" section of the page).
   > Labeling can be done in Omnivore.app, permitting users to group articles. These labels serve the same role as linking to pages within the Logseq graph but only for articles imported from Omnivore.app to Logseq.
* Filtering: Article data can be filtered using [advanced search syntax](https://docs.omnivore.app/using/search.html).
* As a Storage Location for Web Clippings: Create a graph based on article data from Omnivore.app.
   > Whether one wants to add it to an existing graph or create a new one.
* Customization: Custom templates for article data.

## Usage Instructions

1. Typically, the plugin is installed from the marketplace.
1. Once the plugin is enabled, the API key issuance page will open (Omnivore's [API Key Issuance Page](https://omnivore.app/settings/api)).
1. Open the plugin settings and register the API key.
1. Click the 🔨 button in the top right toolbar to enable the Omnivore toolbar icon. Clicking that icon opens the [[Omnivore]] page, and synchronization begins at that point. This process may take some time.
   > If there are no articles in Omnivore.app's INBOX, importing articles won't be possible. Therefore, it's recommended to add articles to Omnivore.app's INBOX first.

## Synchronization Details

1. The plugin generates a dedicated page named "Omnivore" for synchronization.
1. Content with highlights and additional notes added in Omnivore.app is inserted into article blocks, and custom templates from the plugin settings are applied. This includes attribute data and label links.
1. Synchronization Timing: Synchronization with Omnivore.app starts when the plugin is opened and whenever changes are made to the settings.
   > Moreover, adjustments to the API key, search filters, and synchronization frequency can be made in the plugin settings. Manual synchronization with Omnivore.app can also be initiated by clicking the Omnivore icon in the toolbar.

## Demo

### Fetching

![fetching](screenshots/fetching.gif)

### Settings

![settings](screenshots/settings.gif)

## Contacts

Developer: [Hongbo Wu](https://github.com/sywhb) @ [Omnivore](https://github.com/omnivore-app)

## Contributing

- Kudos to [@Brian](https://twitter.com/Bsunter) for the great [guide](https://briansunter.com/graph/#/page/omnivore-logseq-guide?anchor=ls-block-62b28de3-0e9e-456e-bf29-7e2541213aa5) on how to use Omnivore.app and this plugin. [Chinese translation](https://sywhb.github.io/#/page/omnivore-logseq%20指南) by [@吴洪博](https://twitter.com/Sy98715020), Japanese translation by [YU000jp](https://github.com/YU000jp)

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## FAQ

### I got `TypeError: Cannot read properties of null (reading:’uuid’)` when trying to fetch articles.

This has been fixed in the latest version of the plugin. If you still encounter this issue, please try to click on the empty block on the "Omnivore" page.

### The button to sync with Omnivore is not working after updating settings.

This has been fixed in the latest version of the plugin. If you still encounter this issue, please try to reload the plugin and if it is still not working, please open on issue.
