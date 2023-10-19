[English](https://github.com/omnivore-app/logseq-omnivore)

# Logseq Plugin: *Omnivore*

このプラグインは、Webアプリ[Omnivore.app](https://omnivore.app/)(そのサーバー)にある、Webクリップの記事やそのハイライトなどをLogseqのグラフにインポート、同期します。

## 「Omnivore.app」を利用する

 [Omnivore.app](https://omnivore.app)アカウントにサインアップします。
- 「Omnivore.app」というサイトは、Webクリップのためのツール(Webアプリ)です。気になったページをただ「ブラウザのお気に入りに登録する」のではなく、Webクリップとして管理します。気になった個所などハイライトとともに、複数のサイトを整理して保存します。
    - このアプリは、デスクトップとモバイル、どちらからも無料で利用できます。Webクリップのデータはサーバー(クラウド)上に保存されます。このプラグインでは、それをLogseqに取り込んで保存します。その記事につけたノートも取り込みできます。

### ショーケース

* 日付ごと: Logseq上では、Webクリップされた日付、ハイライトされた日付など、日付ごとに自動的に分類されます。
* 分類と参照: Webクリップにつけたラベルは、タグとしてリンクが機能します。そのため、Webクリップしたページやそのハイライトを、既存のページに関連付けることができます。(そのページの"Linked References"に表示されます。)
   > Omnivore.appでラベル付けをして、それらの記事をグループ化できます。そのラベルが、Logseqグラフにあるページへリンクするのと同じ役割をもちます。ただし、Omnivore.appからLogseqに取り込んだ記事に限ります。
* フィルタリング: [高度な検索構文](https://docs.omnivore.app/using/search.html)を使用して、記事データに基づくフィルタリングが可能
* Webクリップの保存先として: Omnivore.appからの記事データに基づいたグラフを作成
   > 既存のグラフに入れる場合、新規グラフに入れる場合など
* カスタム: 記事データ用のカスタムテンプレート

## 使用方法

1. 通常、マーケットプレースからプラグインをインストールします。
1. プラグインがオンになると、APIキーの発行ページが開きます。 (Omnivoreの[APIキー発行ページ](https://omnivore.app/settings/api))
1. プラグイン設定画面を開いて API キーを登録します。
1. 右上のツールバーにある🔨ボタンを押して、Omnivoreのツールバーアイコンを有効にします。そのアイコンボタンを押すと[[Omnivore]]ページが開きます。そのとき、同期が開始されます。少し時間がかかる場合があります。
   > Omnivore.appのINBOXに記事が存在しない場合は、記事を1つも取り込むことができません。先に、Omnivore.appのINBOXに記事をいれてください。

## 同期について

1. プラグインは「Omnivore」という専用ページを作成して同期をおこないます。
1. Omnivore.appでハイライトをつけたコンテンツ、および追加したノートが記事ブロック内に、挿入されます。プラグイン設定のカスタムテンプレートが適用されます。その属性データとラベルリンクが含まれます。
1. 同期のタイミング: プラグインを開いたときと、設定変更をおこなうたびに、Omnivore.appとの同期を開始します。
    > さらにプラグイン設定で、API キー、検索フィルタ、プラグインがOmnivore.appとどれくらい頻繁に同期するかを変更できます。ツールバーのOmnivoreアイコンをクリックして、手動でOmnivore.appと同期することもできます。

## デモ

### 記事の同期

![取得中](screenshots/fetching.gif)

### プラグイン設定

![設定](screenshots/settings.gif)

## 連絡先

開発者: [Hongbo Wu](https://github.com/sywhb) ＠ [Omnivore](https://github.com/omnivore-app)

日本語の翻訳者: [YU000jp](https://github.com/YU000jp)

## 貢献

- Omnivore.app およびこのプラグインの使用方法に関する素晴らしい[ガイド](https://briansunter.com/graph/#/page/omnivore-logseq-guide?anchor=ls-block-62b28de3-0e9e-456e-bf29-7e2541213aa5)を提供してくれた[@Brian](https://twitter.com/Bsunter)に感謝します。[中国語翻訳](https://sywhb.github.io/#/page/omnivore-logseq%20指南)は[@吴洪博](https://twitter.com/Sy98715020)によって提供されました。

プルリクエストは歓迎されています。大規模な変更については、まず問題を開いて変更内容を議論してください。

## ライセンス

[MIT](https://choosealicense.com/licenses/mit/)

## FAQ

### 記事を取得しようとしたときに `TypeError: Cannot read properties of null (reading: 'uuid')` と表示されます。

この問題はプラグインの最新バージョンで修正されています。それにもかかわらず、この問題が引き続き発生する場合は、「Omnivore」ページの空のブロックをクリックしてみてください。

### Omnivore との同期ボタンが設定を更新した後に動作しません。

この問題はプラグインの最新バージョンで修正されています。それにもかかわらず、この問題が引き続き発生する場合は、プラグインを再読み込みしてみてください。それでも動作しない場合は、問題を開いてください。
