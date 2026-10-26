# animation\*.interval,インターバル

- **規格**: [animation-star-.interval.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/animation-star-.interval/) (ukadoc-spec/descript/shell-surfaces/surface-brace/animation-star-.interval.md)
- **検索語**: animation
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「animation」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/surface/surface-parser.js:58` (コメント) `* surfaces.txt をパースして collisions, elements, animations を抽出`
- `ui/js/surface/surface-parser.js:60` (コメント) `* @returns {{ collisions: Record<string, CollisionArea[]>, elements: Record<string, Surfac`
- `ui/js/surface/surface-parser.js:65`  `const animations = {};`
- `ui/js/surface/surface-parser.js:129` (コメント) `// animation[ID].interval,[interval]`
- `ui/js/surface/surface-parser.js:130`  `const match = trimmed.match(/^animation(\d+)\.interval,\s*(.+)$/);`
