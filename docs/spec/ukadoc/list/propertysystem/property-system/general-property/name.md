# name

- **規格**: [name.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/name/)
- **検索語**: name
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「name」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `ui/js/core/app-update.js:26`  `const ghostName = targetGhostName || gc.currentGhost?.name || "とらふぃっく☆とれいん";`
- `ui/js/ghost/ghost.js:13` (コメント) `* @property {string} name`
- `ui/js/ghost/ghost.js:48`  `? JSON.parse(localStorage.getItem(AppConfig.storageKeys.lastGhost) || "{}")?.name`
- `ui/js/ghost/ghost.js:52`  `const found = this.ghosts.find((g) => g.name === targetGhostName);`
- `ui/js/ghost/ghost.js:73`  `return result.ghosts?.some((g) => g.name === ghostInfo.name) || false;`
