# surfaceブレス記述例

- **規格**: [introduction_surfacebrace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/introduction_surfacebrace/) (ukadoc-spec/descript/shell-surfaces/surface-brace/introduction_surfacebrace.md)
- **検索語**: surface
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「surface」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/ghost/ghost.js:3`  `import { ghostSurfaceMethods } from "../surface/ghost-surface.js";`
- `ui/js/ghost/ghost.js:8` (コメント) `* (SHIORI通信は ghost-shiori.js、サーフェス表示は ghost-surface.js)`
- `ui/js/ghost/ghost.js:166`  `this.app.surfaceManager.loadSurfacesTxt(`
- `ui/js/ghost/ghost.js:193`  `this.app.surfaceManager.loadSurfacesTxt(${ghostPath}/shell/${shellName});`
- `ui/js/surface/surface-parser.js:2` (コメント) `* surfaces.txt パーサーモジュール`
