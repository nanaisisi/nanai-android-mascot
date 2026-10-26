# name,バルーン名

- **規格**: [name.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/descript-txt/name/) (ukadoc-spec/descript/balloon/descript-txt/name.md)
- **検索語**: name
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `ui/js/core/app-update.js:26` `const ghostName = targetGhostName || gc.currentGhost?.name || "とらふぃっく☆とれいん";`
- `ui/js/ghost/ghost.js:13` (コメント) `* @property {string} name`
- `ui/js/ghost/ghost.js:48` `? JSON.parse(localStorage.getItem(AppConfig.storageKeys.lastGhost) || "{}")?.name`
- `ui/js/ghost/ghost.js:52` `const found = this.ghosts.find((g) => g.name === targetGhostName);`
- `ui/js/ghost/ghost.js:73` `return result.ghosts?.some((g) => g.name === ghostInfo.name) || false;`
