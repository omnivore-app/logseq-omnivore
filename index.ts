import "@logseq/libs";
import { LSPluginBaseInfo } from "@logseq/libs/dist/LSPlugin";

const delay = (t = 100) => new Promise((r) => setTimeout(r, t));
const endpoint = "https://api-prod.omnivore.app/api/graphql";

async function loadArticle(
  username: string,
  slug: string,
  token: string
): Promise<any> {
  const {
    data: {
      article: { article },
    },
  } = await fetch(endpoint, {
    headers: {
      "content-type": "application/json",
      authorization: token,
    },
    body: `{\"query\":\"\\n  query GetArticle(\\n    $username: String!\\n    $slug: String!\\n    $includeFriendsHighlights: Boolean\\n  ) {\\n    article(username: $username, slug: $slug) {\\n      ... on ArticleSuccess {\\n        article {\\n          ...ArticleFields\\n          content\\n          highlights(input: { includeFriends: $includeFriendsHighlights }) {\\n            ...HighlightFields\\n          }\\n          labels {\\n            ...LabelFields\\n          }\\n        }\\n      }\\n      ... on ArticleError {\\n        errorCodes\\n      }\\n    }\\n  }\\n  \\n  fragment ArticleFields on Article {\\n    id\\n    title\\n    url\\n    author\\n    image\\n    savedAt\\n    createdAt\\n    publishedAt\\n    contentReader\\n    originalArticleUrl\\n    readingProgressPercent\\n    readingProgressAnchorIndex\\n    slug\\n    isArchived\\n    description\\n    linkId\\n    state\\n  }\\n\\n  \\n  fragment HighlightFields on Highlight {\\n    id\\n    shortId\\n    quote\\n    prefix\\n    suffix\\n    patch\\n    annotation\\n    createdByMe\\n    updatedAt\\n    sharedAt\\n  }\\n\\n  \\n  fragment LabelFields on Label {\\n    id\\n    name\\n    color\\n    description\\n    createdAt\\n  }\\n\\n\",\"variables\":{\"username\":\"${username}\",\"slug\":\"${slug}\",\"includeFriendsHighlights\":false}}`,
    method: "POST",
  }).then((res) => res.json());

  return article;
}

async function loadArticles(
  username: string,
  token: string,
  after: number = 0,
  first: number = 10
): Promise<[any[], boolean]> {
  const {
    data: {
      search: { edges, pageInfo },
    },
  } = await fetch(endpoint, {
    headers: {
      "content-type": "application/json",
      authorization: token,
    },
    body: `{"query":"\\n    query Search($after: String, $first: Int, $query: String) {\\n      search(first: $first, after: $after, query: $query) {\\n        ... on SearchSuccess {\\n          edges {\\n            cursor\\n            node {\\n              id\\n              title\\n              slug\\n              url\\n              pageType\\n              contentReader\\n              createdAt\\n              isArchived\\n              readingProgressPercent\\n              readingProgressAnchorIndex\\n              author\\n              image\\n              description\\n              publishedAt\\n              ownedByViewer\\n              originalArticleUrl\\n              uploadFileId\\n              labels {\\n                id\\n                name\\n                color\\n              }\\n              pageId\\n              shortId\\n              quote\\n              annotation\\n              state\\n              siteName\\n            }\\n          }\\n          pageInfo {\\n            hasNextPage\\n            hasPreviousPage\\n            startCursor\\n            endCursor\\n            totalCount\\n          }\\n        }\\n        ... on SearchError {\\n          errorCodes\\n        }\\n      }\\n    }\\n  ","variables":{"after":"${after}","first":${first}}}`,
    method: "POST",
  }).then((res) => res.json());

  const ret = [];
  for (const { node } of edges) {
    const { title, author, description, slug } = node;
    ret.push({
      content: `[${title}](https://omnivore.app/${username}/${slug}) [:small.opacity-50 "By ${author}"]
collapsed:: true    
> ${description}.`,
      slug,
    });
  }

  return [ret, pageInfo.hasNextPage];
}

/**
 * main entry
 * @param baseInfo
 */
function main(baseInfo: LSPluginBaseInfo) {
  let loading = false;
  const { token, username } = logseq.settings;

  logseq.provideModel({
    async loadOmnivore() {
      const info = await logseq.App.getUserConfigs();
      if (loading) return;

      const pageName = "Omnivore";
      const blockTitle = "## 🔖 Articles";
      const highlightTitle = "### 🔍 Highlights";
      const labelTitle = "### 🏷 Labels";
      const dateTitle = "### 📅 Date";

      logseq.App.pushState("page", { name: pageName });

      await delay(300);

      loading = true;

      try {
        const currentPage = await logseq.Editor.getCurrentPage();
        if (currentPage?.originalName !== pageName)
          throw new Error("page error");

        const pageBlocksTree = await logseq.Editor.getCurrentPageBlocksTree();
        let targetBlock = pageBlocksTree[0]!;

        targetBlock = await logseq.Editor.insertBlock(
          targetBlock.uuid,
          "🚀 Fetching articles ...",
          { before: true }
        );

        const size = 100;
        let after = 0;
        while (true) {
          const [blocks, hasNextPage] = await loadArticles(username, token, after, size);

          for (const { content, slug } of blocks) {
            const { labels, highlights, savedAt } = await loadArticle(
              username,
              slug,
              token
            );

            const articleBlock = await logseq.Editor.insertBlock(
              targetBlock.uuid,
              content
            );

            const dateBlock = await logseq.Editor.insertBlock(
              articleBlock.uuid,
              dateTitle
            );
            await logseq.Editor.insertBlock(
              dateBlock.uuid,
              `[[${new Date(savedAt).toDateString()}]]`
            );

            if (labels?.length) {
              const labelBlock = await logseq.Editor.insertBlock(
                articleBlock.uuid,
                labelTitle
              );

              for (const label of labels) {
                await logseq.Editor.insertBlock(
                  labelBlock.uuid,
                  `[[${label.name}]]`
                );
              }
            }

            if (highlights?.length) {
              const highlightBlock = await logseq.Editor.insertBlock(
                articleBlock.uuid,
                highlightTitle
              );

              for (const highlight of highlights) {
                await logseq.Editor.insertBlock(
                  highlightBlock.uuid,
                  highlight.quote
                );
              }
            }

            // sleep for a second to avoid rate limit
            await delay(1000);
          }

          if (!hasNextPage) {
            break;
          }
          after += size;
        }

        await logseq.Editor.updateBlock(targetBlock.uuid, blockTitle);
      } catch (e) {
        logseq.UI.showMsg(e.toString(), "warning");
        console.error(e);
      } finally {
        loading = false;
      }
    },
  });

  logseq.App.registerUIItem("toolbar", {
    key: "logseq-omnivore",
    template: `
      <a data-on-click="loadOmnivore" style="font-size: initial;"
         class="button">O</a>
    `,
  });

  logseq.provideStyle(`
    [data-injected-ui=logseq-omnivore-${baseInfo.id}] {
      display: flex;
      align-items: center;
    }
  `);
}

// bootstrap
logseq.ready(main).catch(console.error);
