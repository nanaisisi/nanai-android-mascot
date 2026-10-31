# number.font.name,フォント名

- **規格**: [number.font.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/)
- **検索語**: number.font.name
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript.js` にて `number.font.name` をパースし、CSS 変数 `--balloon-number-font-family` として動的適用を実装済み。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font/special.js:15` `const numFontName = props["number.font.name"];`
