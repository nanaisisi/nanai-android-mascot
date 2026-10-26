# char\*.menuitem\*,ID

- **規格**: [char-star-.menuitem-star.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/char-star-.menuitem-star/) (ukadoc-spec/descript/shell/descript-txt/char-star-.menuitem-star.md)
- **検索語**: char
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「char」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/surface/character.js:5`  `const img = document.getElementById("subchar-img");`
- `ui/js/surface/character.js:6`  `const root = document.getElementById("subchar-root");`
- `ui/js/surface/character.js:8` (コメント) `// URLパラメータからスコープIDを取得 (例: character.html?scope=1)`
- `ui/js/surface/character.js:20`  `listenFn(update-subchar-image-${scopeId}, (event) => {`
- `ui/js/surface/character.js:34`  `emitFn("request-subchar-image", { scopeId });`
