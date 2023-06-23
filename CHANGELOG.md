## [1.13.3](https://github.com/omnivore-app/logseq-omnivore/compare/v1.13.2...v1.13.3) (2023-06-23)


### Bug Fixes

* incorrect highlight position by incorrectly using highlight position percentage which old highlights do not have it ([8733dea](https://github.com/omnivore-app/logseq-omnivore/commit/8733deab124130231dc5ee30a20dfde986ddb5a2))

## [1.13.2](https://github.com/omnivore-app/logseq-omnivore/compare/v1.13.1...v1.13.2) (2023-06-22)


### Bug Fixes

* slash converted to dash in the page name ([c99387b](https://github.com/omnivore-app/logseq-omnivore/commit/c99387b05ac49b67efa1efea4fa9c5f03e781ceb))

## [1.13.1](https://github.com/omnivore-app/logseq-omnivore/compare/v1.13.0...v1.13.1) (2023-06-22)


### Bug Fixes

* failed to fetch highlight when quote is null ([3128a10](https://github.com/omnivore-app/logseq-omnivore/commit/3128a10889bc99c0f5804e06feb95d378f42b117))
* failed to save page in windows by removing invisible characters in the page name ([7a92a9f](https://github.com/omnivore-app/logseq-omnivore/commit/7a92a9f807dd8893cdcaae99f641daa05c935f4c))

# [1.13.0](https://github.com/omnivore-app/logseq-omnivore/compare/v1.12.5...v1.13.0) (2023-05-19)


### Bug Fixes

* add dateArchived to the exposed variable in the article template ([e619009](https://github.com/omnivore-app/logseq-omnivore/commit/e6190095b0bfcc86da6bb2364bf3f675ebc88552))
* escape special characters in the page name ([17e2089](https://github.com/omnivore-app/logseq-omnivore/commit/17e20898701d6d4638e00b0a23cb0b7320a91f03))
* truncate filename length to 100 ([bca3f75](https://github.com/omnivore-app/logseq-omnivore/commit/bca3f75e437b2037239e1953a16bfebc223d924f))


### Features

* export highlighted markdown content using {{{ content }}} in the article template ([18628cb](https://github.com/omnivore-app/logseq-omnivore/commit/18628cb4c8727f6bf0113c0c4ac71ae8cc44e7a5))

## [1.12.5](https://github.com/omnivore-app/logseq-omnivore/compare/v1.12.4...v1.12.5) (2023-05-11)


### Bug Fixes

* add a title block for highlights and add note as a variable in the highlight template ([6ee5090](https://github.com/omnivore-app/logseq-omnivore/commit/6ee5090b7d140c0b8d153b166cd6aa9af54d8556))
* add function map to the template ([e7b0cb1](https://github.com/omnivore-app/logseq-omnivore/commit/e7b0cb108ea018f80c835b175b27113a3f22f37c))
* add release notes ([33b37ca](https://github.com/omnivore-app/logseq-omnivore/commit/33b37ca5529a8ebcc9b84970b8df161d6adcd781))
* add status in the article template ([2eb0d7c](https://github.com/omnivore-app/logseq-omnivore/commit/2eb0d7c9ffc7f266130e29268071d4cc20971bc7))
* add wordsCount and readLength to the exposed variables in the article template ([d47f983](https://github.com/omnivore-app/logseq-omnivore/commit/d47f98381dd0e31b9531758b1645d2b4bfc2bedf))
* allow separate page for each article ([db7a2fe](https://github.com/omnivore-app/logseq-omnivore/commit/db7a2fe4dbeb760541a09931cc00cd1dea3c74f2))
* allow unchanged block properties not being overwritten ([013fa19](https://github.com/omnivore-app/logseq-omnivore/commit/013fa1980c5b1dc0a4496268ae903d863dbe0879))
* delete page if article is synced to a separate page and page is not a journal ([ca2af3e](https://github.com/omnivore-app/logseq-omnivore/commit/ca2af3e70ecdf99c969c2cc89d7c4c9c5dcba89b))
* increase height of highlight template textarea in settings ([3cf44f0](https://github.com/omnivore-app/logseq-omnivore/commit/3cf44f0e9bd7e088ec6f7d73278bb94cd07d752c))

## [1.12.4](https://github.com/omnivore-app/logseq-omnivore/compare/v1.12.3...v1.12.4) (2023-04-13)


### Bug Fixes

* replace all empty lines with blockquote ">" to preserve paragraphs ([cfcb32e](https://github.com/omnivore-app/logseq-omnivore/commit/cfcb32e98603fdc176bab6d669e51d0f0e012bc1))

## [1.12.3](https://github.com/omnivore-app/logseq-omnivore/compare/v1.12.2...v1.12.3) (2023-04-12)


### Bug Fixes

* add dateRead variable in the article template ([6ac9b3b](https://github.com/omnivore-app/logseq-omnivore/commit/6ac9b3babf6a3a0ef54d022082b0d7d6a6fbac09))

## [1.12.2](https://github.com/omnivore-app/logseq-omnivore/compare/v1.12.1...v1.12.2) (2023-04-12)


### Bug Fixes

* add rawDateRead and rawDatePublished in the template ([84f1a78](https://github.com/omnivore-app/logseq-omnivore/commit/84f1a781f01041cb4fdea228edbf18f5c56f7fb2))
* add type to the template ([c9b81de](https://github.com/omnivore-app/logseq-omnivore/commit/c9b81def99f6679e8d1bdd26d29e37abd0534af2))
* increase height of template textarea in settings ([7e37da7](https://github.com/omnivore-app/logseq-omnivore/commit/7e37da7d9e7c8d6803ea129b996a8575a1eb9d6c))
* update description of template settings ([7c56358](https://github.com/omnivore-app/logseq-omnivore/commit/7c56358b9d1da2fe7e0adbad758d773a8780795e))

## [1.12.1](https://github.com/omnivore-app/logseq-omnivore/compare/v1.12.0...v1.12.1) (2023-04-10)


### Bug Fixes

* sort highlights by position percentage if available ([0309413](https://github.com/omnivore-app/logseq-omnivore/commit/0309413d219741b7a537c364ba26dcaf19644b14))

# [1.12.0](https://github.com/omnivore-app/logseq-omnivore/compare/v1.11.8...v1.12.0) (2023-04-05)


### Features

* add note variable to the article and highlight template ([55405b4](https://github.com/omnivore-app/logseq-omnivore/commit/55405b4aad076c7d9fa7f5e860ac52bd7a82652c))
* add server endpoint to the settings ([3bb633c](https://github.com/omnivore-app/logseq-omnivore/commit/3bb633c0296b29524f0da129f79635b7c5f30453))
* fetch note from articles api ([e7bd281](https://github.com/omnivore-app/logseq-omnivore/commit/e7bd281eff0574ffdfbd5f6875be07f676140a97))

## [1.11.8](https://github.com/omnivore-app/logseq-omnivore/compare/v1.11.7...v1.11.8) (2023-03-28)


### Bug Fixes

* reset background sync job id after plugin reload ([b917b07](https://github.com/omnivore-app/logseq-omnivore/commit/b917b07384868b4e5524982d8d634bbae1cbe44f))

## [1.11.7](https://github.com/omnivore-app/logseq-omnivore/compare/v1.11.6...v1.11.7) (2023-03-28)


### Bug Fixes

* reset loading state before unload ([f2dcd60](https://github.com/omnivore-app/logseq-omnivore/commit/f2dcd602ffd2ee6dd7837d17488f90120eaf0186))
* unload the plugin before reloaded ([e1e80a1](https://github.com/omnivore-app/logseq-omnivore/commit/e1e80a1f4ebe27ba33501f9fd0c060b52be24126))

## [1.11.6](https://github.com/omnivore-app/logseq-omnivore/compare/v1.11.5...v1.11.6) (2023-03-17)


### Bug Fixes

* accept YY and DD in preferred date format ([6de27bc](https://github.com/omnivore-app/logseq-omnivore/commit/6de27bc8bcdd8c7208b6d16ddd68331a8eeaa941))
* add article variables to the highlight template rendering ([fd08d34](https://github.com/omnivore-app/logseq-omnivore/commit/fd08d340c02088e2f9a507bb28cdcdb7fc2512ea))
* add datePublished variable to the template ([38ea45c](https://github.com/omnivore-app/logseq-omnivore/commit/38ea45c5bd71eaab73115161a189931aef9fd76d))
* delete the other duplicates if detected during sync ([a9c7256](https://github.com/omnivore-app/logseq-omnivore/commit/a9c72562c076e190ef357392c3862d9c0e0e5a79))
* format datePublished ([0e60788](https://github.com/omnivore-app/logseq-omnivore/commit/0e60788f34dae20865dd97f22b69ab68b0dee422))
* prevent from multiple concurrent fetches ([cb9147e](https://github.com/omnivore-app/logseq-omnivore/commit/cb9147e193734a5a95a477ce7372112c8509d51b))

## [1.11.5](https://github.com/omnivore-app/logseq-omnivore/compare/v1.11.4...v1.11.5) (2023-02-21)


### Bug Fixes

* labels in highlights are not retrieved ([fa26e85](https://github.com/omnivore-app/logseq-omnivore/commit/fa26e85e5b8fbd67ebfe8b72e3a989ab7ac9cfda))

## [1.11.4](https://github.com/omnivore-app/logseq-omnivore/compare/v1.11.3...v1.11.4) (2023-02-17)


### Bug Fixes

* make links open automatically if missing api key ([e999c08](https://github.com/omnivore-app/logseq-omnivore/commit/e999c0828b1abfba67499aa1cee892405a63ed6d))

## [1.11.3](https://github.com/omnivore-app/logseq-omnivore/compare/v1.11.2...v1.11.3) (2023-02-17)


### Bug Fixes

* date format issue ([918665d](https://github.com/omnivore-app/logseq-omnivore/commit/918665d7ee6f2092767324c04c21925da1f277d4))

## [1.11.2](https://github.com/omnivore-app/logseq-omnivore/compare/v1.11.1...v1.11.2) (2023-01-17)


### Bug Fixes

* sync with omnivore in the background if we are in the right graph when we open Logseq or reload ([152677b](https://github.com/omnivore-app/logseq-omnivore/commit/152677bdd84f6623b7a8ac3cf883c94565504b60))

## [1.11.1](https://github.com/omnivore-app/logseq-omnivore/compare/v1.11.0...v1.11.1) (2023-01-16)


### Bug Fixes

* add markdown content in article template ([8f96d10](https://github.com/omnivore-app/logseq-omnivore/commit/8f96d10c54eec835a7ee216ce32f94b445ad88e0))

# [1.11.0](https://github.com/omnivore-app/logseq-omnivore/compare/v1.10.1...v1.11.0) (2023-01-16)


### Bug Fixes

* sync articles to the right graph only and show an alert if the active graph is not matched ([ddc2744](https://github.com/omnivore-app/logseq-omnivore/commit/ddc27446338035d192cdd459cda061a45a97875d))


### Features

* add command palette for sync and resync Omnivore articles ([17fdc0d](https://github.com/omnivore-app/logseq-omnivore/commit/17fdc0dd891e00bbe53cca444b9acf07b315db39))
* fetch content in markdown format ([619f80b](https://github.com/omnivore-app/logseq-omnivore/commit/619f80b9d28a0563cd2fe9a5f02147ec9363e44d))

## [1.10.1](https://github.com/omnivore-app/logseq-omnivore/compare/v1.10.0...v1.10.1) (2023-01-16)


### Bug Fixes

* Update the plugin name in the logseq marketplace ([da86a8e](https://github.com/omnivore-app/logseq-omnivore/commit/da86a8e5490c3ea63614013b78751e48a4f93ad2))

# [1.10.0](https://github.com/omnivore-app/logseq-omnivore/compare/v1.9.6...v1.10.0) (2022-12-30)


### Features

* Add support for labels on highlights ([af6a4f3](https://github.com/omnivore-app/logseq-omnivore/commit/af6a4f359e83a8659dfa71b44c9a878a571d7918))

## [1.9.6](https://github.com/omnivore-app/logseq-omnivore/compare/v1.9.5...v1.9.6) (2022-12-21)


### Bug Fixes

* date/time parsing + URLs in default template ([55c2fbd](https://github.com/omnivore-app/logseq-omnivore/commit/55c2fbd4e034e192fdfdcdff92382e9c524c1c28))

## [1.9.5](https://github.com/omnivore-app/logseq-omnivore/compare/v1.9.4...v1.9.5) (2022-11-03)


### Bug Fixes

* put template settings in a textarea ([ad20dc1](https://github.com/omnivore-app/logseq-omnivore/commit/ad20dc11683bd2e2bd455cad84a00c01a34008e7))

## [1.9.4](https://github.com/omnivore-app/logseq-omnivore/compare/v1.9.3...v1.9.4) (2022-11-02)


### Bug Fixes

* add available keys in the template settings description ([2b95f9d](https://github.com/omnivore-app/logseq-omnivore/commit/2b95f9daf63cab6cb55da0604bf5666f99ea6f94))
* add highlight template in settings ([2bd38c4](https://github.com/omnivore-app/logseq-omnivore/commit/2bd38c49060335f93b5a47c13ea39da6579f4a8e))
* add required and optional variables in template descriptions ([adc5e48](https://github.com/omnivore-app/logseq-omnivore/commit/adc5e48ec1af3343743ff9e23a4ffc1101ce7394))
* allow labels in the template to be empty ([18b3911](https://github.com/omnivore-app/logseq-omnivore/commit/18b39118c4eac118b5eb2030815e71ea552c9144))
* allow users to specify custom template for the article ([6d88fea](https://github.com/omnivore-app/logseq-omnivore/commit/6d88fea8f6b6e1822bd4c8ae5406ddf3110450c1))
* make icon use the theme color ([b77e64f](https://github.com/omnivore-app/logseq-omnivore/commit/b77e64fb70461f08bbabfcf7613b60dc28de36e7))
* remove redundant ) in the article url ([8f33965](https://github.com/omnivore-app/logseq-omnivore/commit/8f3396581bc7dabd08e4b62426e7a909e2e8494c))

## [1.9.3](https://github.com/omnivore-app/logseq-omnivore/compare/v1.9.2...v1.9.3) (2022-10-14)


### Bug Fixes

* delete article blocks if the articles are deleted in Omnivore ([0b87e0e](https://github.com/omnivore-app/logseq-omnivore/commit/0b87e0efd9f2413c923eb732185cdadab9913b69))
* get correct updated reason from updates since api response ([d888ca0](https://github.com/omnivore-app/logseq-omnivore/commit/d888ca0fc1d679f95ca4e69206ec1d3562c8c7d7))
* use prod api endpoint ([f11c98c](https://github.com/omnivore-app/logseq-omnivore/commit/f11c98c58507aa4597b19f1881a4cd66bbf655b7))

## [1.9.2](https://github.com/omnivore-app/logseq-omnivore/compare/v1.9.1...v1.9.2) (2022-09-19)


### Bug Fixes

* escape quotation marks in the content of highlight and note when running datascript query ([c9d01df](https://github.com/omnivore-app/logseq-omnivore/commit/c9d01dfc1222ae6f61724112c61827243c4bb2dd))
* remove duplicate highlights by adding parent block id in the datascript query ([ac6d534](https://github.com/omnivore-app/logseq-omnivore/commit/ac6d534a9c8a5938135b588a19660cf30a33eb00))

## [1.9.1](https://github.com/omnivore-app/logseq-omnivore/compare/v1.9.0...v1.9.1) (2022-09-16)


### Bug Fixes

* unescape markdown special charaters to avoid double escaping in logseq ([9ec3fec](https://github.com/omnivore-app/logseq-omnivore/commit/9ec3fecd94bdc61b7190ebea42d9ecfda8ac8696))

# [1.9.0](https://github.com/omnivore-app/logseq-omnivore/compare/v1.8.1...v1.9.0) (2022-09-14)


### Bug Fixes

* bold title ([8d8af29](https://github.com/omnivore-app/logseq-omnivore/commit/8d8af29f0ad16313f2c05306698fb8a828d64e9c))
* escape Latex ([5b97b57](https://github.com/omnivore-app/logseq-omnivore/commit/5b97b57425ca0b81e546b1b8a9b4d2f05f2b2b16))
* escape Markdown characters in quote ([cadf2e9](https://github.com/omnivore-app/logseq-omnivore/commit/cadf2e92c9d923a6113d6fc6974d386852031184))
* escape Markdown characters in quote and title ([f6f36a3](https://github.com/omnivore-app/logseq-omnivore/commit/f6f36a3bfbe179329311ffeb01292ef16107fe73))
* insert highlight to existing block as child ([93e1edf](https://github.com/omnivore-app/logseq-omnivore/commit/93e1edfb8dd53cb90f73ac7b84d3fc47846788bf))
* query to find existing blocks ([82dc459](https://github.com/omnivore-app/logseq-omnivore/commit/82dc4591161d0bcfefdf909bd05ff6fc3423a5f3))
* update existing block to retain references ([e476ece](https://github.com/omnivore-app/logseq-omnivore/commit/e476ecebe06f32cc09632af923539ba17858c047))
* update existing highlight block ([a21606a](https://github.com/omnivore-app/logseq-omnivore/commit/a21606a23ff63039891cd1db25cd65b6d023e612))
* use parent block uuid in the query ([d235199](https://github.com/omnivore-app/logseq-omnivore/commit/d235199f73d61013172b0f8fce4a77ea7fa8c21b))


### Features

* use datascript query to fetch existing blocks ([3c5e596](https://github.com/omnivore-app/logseq-omnivore/commit/3c5e5962eaedb9724e5959a9fb257c9faae27af1))

## [1.8.1](https://github.com/omnivore-app/logseq-omnivore/compare/v1.8.0...v1.8.1) (2022-08-26)


### Bug Fixes

* failed to sort highlights in the file ([d5e412c](https://github.com/omnivore-app/logseq-omnivore/commit/d5e412c6cb27e1dd53d8b7254db5c42aa4e99588))
* sort highlights by location in the file if an error is catched ([578ff3b](https://github.com/omnivore-app/logseq-omnivore/commit/578ff3bee1f23e0d615ecfb1e543ef2ee66ee551))

# [1.8.0](https://github.com/omnivore-app/logseq-omnivore/compare/v1.7.0...v1.8.0) (2022-08-23)


### Features

* replace new icon on the toolbar ([5779100](https://github.com/omnivore-app/logseq-omnivore/commit/577910024c98a99e06db19ebdd06481373eb8853))

# [1.7.0](https://github.com/omnivore-app/logseq-omnivore/compare/v1.6.0...v1.7.0) (2022-08-05)


### Features

* add highlightOrder option to let user select a way to sort new highlights in the article ([a796750](https://github.com/omnivore-app/logseq-omnivore/commit/a7967506ddf5397cda3ab3219d0a5fe5d436bf43))

# [1.6.0](https://github.com/omnivore-app/logseq-omnivore/compare/v1.5.0...v1.6.0) (2022-07-14)


### Features

* add syncAt to settings so its easier to reset ([98d0254](https://github.com/omnivore-app/logseq-omnivore/commit/98d02544ccf52941a2e05e70d317d21df212a940))

# [1.5.0](https://github.com/omnivore-app/logseq-omnivore/compare/v1.4.6...v1.5.0) (2022-07-12)


### Bug Fixes

* failed to sync when existing block has no uuid ([0c83cd8](https://github.com/omnivore-app/logseq-omnivore/commit/0c83cd83dbf11aec981b9bdce8a552440ae8bda6))


### Features

* sort articles by savedAt ([025a04c](https://github.com/omnivore-app/logseq-omnivore/commit/025a04c8d4788ee60baa4722a5356e52a132de8c))

## [1.4.6](https://github.com/omnivore-app/logseq-omnivore/compare/v1.4.5...v1.4.6) (2022-07-12)


### Bug Fixes

* only sync into the graph we were initially opened in ([7586891](https://github.com/omnivore-app/logseq-omnivore/commit/758689121333a0ecaa630694a3f958b0d820afe2))

## [1.4.5](https://github.com/omnivore-app/logseq-omnivore/compare/v1.4.4...v1.4.5) (2022-07-01)


### Bug Fixes

* sync articles using updated syncAt timestamp ([29e77c3](https://github.com/omnivore-app/logseq-omnivore/commit/29e77c33c08bb88275355b3b855736de5f35645c))

## [1.4.4](https://github.com/omnivore-app/logseq-omnivore/compare/v1.4.3...v1.4.4) (2022-06-30)


### Performance Improvements

* improve performance by using batch insert ([b096d0d](https://github.com/omnivore-app/logseq-omnivore/commit/b096d0d9ef72618466434bbb7c206d6786a83bff))
