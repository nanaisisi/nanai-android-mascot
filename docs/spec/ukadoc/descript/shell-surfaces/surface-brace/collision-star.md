# collision\*,始点X,始点Y,終点X,終点Y,ID

- **規格**: [collision-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/collision-star/) (ukadoc-spec/descript/shell-surfaces/surface-brace/collision-star.md)
- **検索語**: collision
- **対応状況**: ❓ 要確認(surface 関連語)

## 突合結果

サーフェス処理 (ui/js/surface/) に関連する語「collision」が出現。surfaces.txt の該当機能として実装されているかは個別の読解が必要。

## 実装箇所

- `ui/js/surface/surface-parser.js:58` (コメント) `* surfaces.txt をパースして collisions, elements, animations を抽出`
- `ui/js/surface/surface-parser.js:60` (コメント) `* @returns {{ collisions: Record<string, CollisionArea[]>, elements: Record<string, Surfac`
- `ui/js/surface/surface-parser.js:63`  `const collisions = {};`
- `ui/js/surface/surface-parser.js:79`  `if (!collisions[s]) collisions[s] = [];`
- `ui/js/surface/surface-parser.js:84` (コメント) `// collisionex[ID],[name],[shape],[coords...] または collision[ID],[coords...],[name]`
