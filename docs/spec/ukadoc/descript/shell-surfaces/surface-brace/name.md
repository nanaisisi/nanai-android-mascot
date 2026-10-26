# name,定義名

- **規格**: [name.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/name/) (ukadoc-spec/descript/shell-surfaces/surface-brace/name.md)
- **検索語**: name
- **対応状況**: ⚠️ 一部対応 (Rust パーサー `crates/ui/src/surfaces.rs` で解析・データ化実装済 / 描画・実行への反映は別レイヤー)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `crates/ui/src/surfaces.rs` （Rust 版 surfaces.txt パーサー：Element / Collision / SERIKO / Alias / append の解析）

- `ui/js/core/app-update.js:26` `const ghostName = targetGhostName || gc.currentGhost?.name || "とらふぃっく☆とれいん";`
- `ui/js/ghost/ghost.js:13` (コメント) `* @property {string} name`
- `ui/js/ghost/ghost.js:48` `? JSON.parse(localStorage.getItem(AppConfig.storageKeys.lastGhost) || "{}")?.name`
- `ui/js/ghost/ghost.js:52` `const found = this.ghosts.find((g) => g.name === targetGhostName);`
- `ui/js/ghost/ghost.js:73` `return result.ghosts?.some((g) => g.name === ghostInfo.name) || false;`
