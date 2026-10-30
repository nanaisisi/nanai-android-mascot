# number.font.height,数値

- **規格**: [number.font.height.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/)
- **検索語**: number.font.height
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript.js` にて `number.font.height` をパースし、CSS 変数 `--balloon-number-font-size` として動的適用を実装済み。


## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:321` `// [number.font.name,フォント名], [number.font.height,数値], [number.font.color.r,数値], `
- `ui/js/core/actions/balloon-descript/font.js:329` `const numFontHeight = parseInt(props["number.font.height"], 10);`
- `tests/balloon-descript.test.js:119` `"number.font.height": "12",`
