# surfaceブレス記述例

- **規格**: [introduction_surfacebrace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/introduction_surfacebrace/) (ukadoc-spec/descript/shell-surfaces/surface-brace/introduction_surfacebrace.md)
- **検索語**: surface
- **対応状況**: ⚠️ 一部対応 (Rust パーサー `crates/ui/src/surfaces.rs` で解析・データ化実装済 / 描画・実行への反映は別レイヤー)

## 突合結果

surface-parser.js / surface-animation-manager.js に該当の解析・処理は確認できない。

## 実装箇所

- `crates/ui/src/surfaces.rs` （Rust 版 surfaces.txt パーサー：Element / Collision / SERIKO / Alias / append の解析）

- `ui/js/ghost/ghost.js:3` `import { ghostSurfaceMethods } from "../surface/ghost-surface.js";`
- `ui/js/ghost/ghost.js:8` (コメント) `* (SHIORI通信は ghost-shiori.js、サーフェス表示は ghost-surface.js)`
- `ui/js/ghost/ghost.js:166` `this.app.surfaceManager.loadSurfacesTxt(`
- `ui/js/ghost/ghost.js:193` `this.app.surfaceManager.loadSurfacesTxt(${ghostPath}/shell/${shellName});`
- `ui/js/surface/surface-parser.js:2` (コメント) `* surfaces.txt パーサーモジュール`
