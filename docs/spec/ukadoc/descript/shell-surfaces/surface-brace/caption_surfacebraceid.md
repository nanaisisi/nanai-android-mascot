# surface\*ブレスで可能なID指定

- **規格**: [caption_surfacebraceid.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/caption_surfacebraceid/) (ukadoc-spec/descript/shell-surfaces/surface-brace/caption_surfacebraceid.md)
- **検索語**: surface
- **対応状況**: ❓ 要確認(surface 関連語)

## 突合結果

サーフェス処理 (ui/js/surface/) に関連する語「surface」が出現。surfaces.txt の該当機能として実装されているかは個別の読解が必要。

## 実装箇所

- `ui/js/ghost/ghost.js:3`  `import { ghostSurfaceMethods } from "../surface/ghost-surface.js";`
- `ui/js/ghost/ghost.js:8` (コメント) `* (SHIORI通信は ghost-shiori.js、サーフェス表示は ghost-surface.js)`
- `ui/js/ghost/ghost.js:166`  `this.app.surfaceManager.loadSurfacesTxt(`
- `ui/js/ghost/ghost.js:193`  `this.app.surfaceManager.loadSurfacesTxt(${ghostPath}/shell/${shellName});`
- `ui/js/surface/surface-parser.js:2` (コメント) `* surfaces.txt パーサーモジュール`
