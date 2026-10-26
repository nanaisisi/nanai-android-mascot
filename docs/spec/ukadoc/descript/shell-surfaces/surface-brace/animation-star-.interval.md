# animation\*.interval,インターバル

- **規格**: [animation-star-.interval.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/animation-star-.interval/) (ukadoc-spec/descript/shell-surfaces/surface-brace/animation-star-.interval.md)
- **検索語**: animation
- **対応状況**: ✅ 実装済

## 突合結果

surface-parser.js が解析し、判定・再生に利用している。

## 実装箇所

- `ui/js/surface/surface-parser.js:58` (コメント) `* surfaces.txt をパースして collisions, elements, animations を抽出`
- `ui/js/surface/surface-parser.js:60` (コメント) `* @returns {{ collisions: Record<string, CollisionArea[]>, elements: Record<string, Surfac`
- `ui/js/surface/surface-parser.js:65` `const animations = {};`
- `ui/js/surface/surface-parser.js:129` (コメント) `// animation[ID].interval,[interval]`
- `ui/js/surface/surface-parser.js:130` `const match = trimmed.match(/^animation(\d+)\.interval,\s*(.+)$/);`
