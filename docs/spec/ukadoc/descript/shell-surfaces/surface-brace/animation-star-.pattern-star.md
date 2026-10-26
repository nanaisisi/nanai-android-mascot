# animation\*.pattern\*,描画メソッド,サーフェス番号,ウェイト,X座標,Y座標(,オプション...)

- **規格**: [animation-star-.pattern-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/animation-star-.pattern-star/) (ukadoc-spec/descript/shell-surfaces/surface-brace/animation-star-.pattern-star.md)
- **検索語**: animation
- **対応状況**: ⚠️ 一部対応

## 突合結果

surface-parser.js が解析 (パターン種別など) するが、描画への反映は個別未確認。

## 実装箇所

- `ui/js/surface/surface-parser.js:58` (コメント) `* surfaces.txt をパースして collisions, elements, animations を抽出`
- `ui/js/surface/surface-parser.js:60` (コメント) `* @returns {{ collisions: Record<string, CollisionArea[]>, elements: Record<string, Surfac`
- `ui/js/surface/surface-parser.js:65`  `const animations = {};`
- `ui/js/surface/surface-parser.js:129` (コメント) `// animation[ID].interval,[interval]`
- `ui/js/surface/surface-parser.js:130`  `const match = trimmed.match(/^animation(\d+)\.interval,\s*(.+)$/);`
