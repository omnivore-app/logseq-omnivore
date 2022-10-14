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
