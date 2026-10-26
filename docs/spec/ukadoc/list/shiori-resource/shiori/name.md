# name

- **規格**: [name.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/shiori/name/) (ukadoc-spec/list/shiori-resource/shiori/name.md)
- **検索語**: name
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「name」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/core/app-update.js:26`  `const ghostName = targetGhostName || gc.currentGhost?.name || "とらふぃっく☆とれいん";`
- `ui/js/ghost/ghost.js:13` (コメント) `* @property {string} name`
- `ui/js/ghost/ghost.js:48`  `? JSON.parse(localStorage.getItem(AppConfig.storageKeys.lastGhost) || "{}")?.name`
- `ui/js/ghost/ghost.js:52`  `const found = this.ghosts.find((g) => g.name === targetGhostName);`
- `ui/js/ghost/ghost.js:73`  `return result.ghosts?.some((g) => g.name === ghostInfo.name) || false;`
