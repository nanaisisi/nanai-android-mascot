# element\*,描画メソッド,ファイル名,X座標,Y座標(,オプション...)

- **規格**: [element-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/element-star/) (ukadoc-spec/descript/shell-surfaces/surface-brace/element-star.md)
- **検索語**: element
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「element」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/surface/surface-parser.js:58` (コメント) `* surfaces.txt をパースして collisions, elements, animations を抽出`
- `ui/js/surface/surface-parser.js:60` (コメント) `* @returns {{ collisions: Record<string, CollisionArea[]>, elements: Record<string, Surfac`
- `ui/js/surface/surface-parser.js:64`  `const elements = {};`
- `ui/js/surface/surface-parser.js:115`  `} else if (trimmed.startsWith("element")) {`
- `ui/js/surface/surface-parser.js:124`  `if (!elements[s]) elements[s] = [];`
