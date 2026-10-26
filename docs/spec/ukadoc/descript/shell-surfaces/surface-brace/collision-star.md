# collision\*,始点X,始点Y,終点X,終点Y,ID

- **規格**: [collision-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/collision-star/) (ukadoc-spec/descript/shell-surfaces/surface-brace/collision-star.md)
- **検索語**: collision
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「collision」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/surface/surface-parser.js:58` (コメント) `* surfaces.txt をパースして collisions, elements, animations を抽出`
- `ui/js/surface/surface-parser.js:60` (コメント) `* @returns {{ collisions: Record<string, CollisionArea[]>, elements: Record<string, Surfac`
- `ui/js/surface/surface-parser.js:63`  `const collisions = {};`
- `ui/js/surface/surface-parser.js:79`  `if (!collisions[s]) collisions[s] = [];`
- `ui/js/surface/surface-parser.js:84` (コメント) `// collisionex[ID],[name],[shape],[coords...] または collision[ID],[coords...],[name]`
