# char\*.name,名前

- **規格**: [char-star-.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/char-star-.name/) (ukadoc-spec/descript/shell/descript-txt/char-star-.name.md)
- **検索語**: char
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「char」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `ui/js/surface/character.js:5` `const img = document.getElementById("subchar-img");`
- `ui/js/surface/character.js:6` `const root = document.getElementById("subchar-root");`
- `ui/js/surface/character.js:8` (コメント) `// URLパラメータからスコープIDを取得 (例: character.html?scope=1)`
- `ui/js/surface/character.js:20` `listenFn(update-subchar-image-${scopeId}, (event) => {`
- `ui/js/surface/character.js:34` `emitFn("request-subchar-image", { scopeId });`
