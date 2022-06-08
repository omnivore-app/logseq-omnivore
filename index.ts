import "@logseq/libs";
import { LSPluginBaseInfo } from "@logseq/libs/dist/libs";

const delay = (t = 100) => new Promise((r) => setTimeout(r, t));

async function loadOmnivoreData(token: string) {
  const endpoint = "http://localhost:4000/api/graphql";
  const {
    data: {
      search: { edges },
    },
  } = await fetch(endpoint, {
    headers: {
      "content-type": "application/json",
      authorization: token,
    },
    body: '{"query":"\\n    query Search($after: String, $first: Int, $query: String) {\\n      search(first: $first, after: $after, query: $query) {\\n        ... on SearchSuccess {\\n          edges {\\n            cursor\\n            node {\\n              id\\n              title\\n              slug\\n              url\\n              pageType\\n              contentReader\\n              createdAt\\n              isArchived\\n              readingProgressPercent\\n              readingProgressAnchorIndex\\n              author\\n              image\\n              description\\n              publishedAt\\n              ownedByViewer\\n              originalArticleUrl\\n              uploadFileId\\n              labels {\\n                id\\n                name\\n                color\\n              }\\n              pageId\\n              shortId\\n              quote\\n              annotation\\n              state\\n              siteName\\n            }\\n          }\\n          pageInfo {\\n            hasNextPage\\n            hasPreviousPage\\n            startCursor\\n            endCursor\\n            totalCount\\n          }\\n        }\\n        ... on SearchError {\\n          errorCodes\\n        }\\n      }\\n    }\\n  ","variables":{"after":"0","first":10}}',
    method: "POST",
  }).then((res) => res.json());

  const ret = edges || [];

  return ret.map(({ node }, i) => {
    const { title, url, author, description, slug } = node;

    return `${i}. [${title}](${url}) [:small.opacity-50 "🔥 ${author} 💬 ${slug}"]
collapsed:: true    
> ${description}`;
  });
}

/**
 * main entry
 * @param baseInfo
 */
function main(baseInfo: LSPluginBaseInfo) {
  let loading = false;
  const { token } = logseq.settings;

  logseq.provideModel({
    async loadOmnivore() {
      const info = await logseq.App.getUserConfigs();
      if (loading) return;

      const pageName = "Omnivore";
      const blockTitle = new Date().toLocaleString();

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
          "🚀 Fetching Omnivore ...",
          { before: true }
        );

        let blocks = await loadOmnivoreData(token);

        blocks = blocks.map((it) => ({ content: it }));

        await logseq.Editor.insertBatchBlock(targetBlock.uuid, blocks, {
          sibling: false,
        });

        await logseq.Editor.updateBlock(
          targetBlock.uuid,
          `## 🔖 Omnivore - ${blockTitle}`
        );
      } catch (e) {
        logseq.App.showMsg(e.toString(), "warning");
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
