# animation\*.option,shared-index

- **規格**: [animation-star-.option-3.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/animation-star-.option-3/) (ukadoc-spec/descript/shell-surfaces/surface-brace/animation-star-.option-3.md)
- **検索語**: animation
- **対応状況**: ❌ 未実装

## 突合結果

surface-parser.js / surface-animation-manager.js に該当の解析・処理は確認できない。

## 実装箇所

- `ui/js/surface/surface-parser.js:58` (コメント) `* surfaces.txt をパースして collisions, elements, animations を抽出`
- `ui/js/surface/surface-parser.js:60` (コメント) `* @returns {{ collisions: Record<string, CollisionArea[]>, elements: Record<string, Surfac`
- `ui/js/surface/surface-parser.js:65`  `const animations = {};`
- `ui/js/surface/surface-parser.js:129` (コメント) `// animation[ID].interval,[interval]`
- `ui/js/surface/surface-parser.js:130`  `const match = trimmed.match(/^animation(\d+)\.interval,\s*(.+)$/);`
