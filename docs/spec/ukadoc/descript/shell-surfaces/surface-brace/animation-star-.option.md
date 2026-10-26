# animation\*.option,exclusive

- **規格**: [animation-star-.option.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/animation-star-.option/) (ukadoc-spec/descript/shell-surfaces/surface-brace/animation-star-.option.md)
- **検索語**: animation
- **対応状況**: ❓ 要確認(surface 関連語)

## 突合結果

サーフェス処理 (ui/js/surface/) に関連する語「animation」が出現。surfaces.txt の該当機能として実装されているかは個別の読解が必要。

## 実装箇所

- `ui/js/surface/surface-parser.js:58` (コメント) `* surfaces.txt をパースして collisions, elements, animations を抽出`
- `ui/js/surface/surface-parser.js:60` (コメント) `* @returns {{ collisions: Record<string, CollisionArea[]>, elements: Record<string, Surfac`
- `ui/js/surface/surface-parser.js:65`  `const animations = {};`
- `ui/js/surface/surface-parser.js:129` (コメント) `// animation[ID].interval,[interval]`
- `ui/js/surface/surface-parser.js:130`  `const match = trimmed.match(/^animation(\d+)\.interval,\s*(.+)$/);`
