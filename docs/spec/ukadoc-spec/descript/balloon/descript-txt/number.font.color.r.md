# number.font.color.r,数値

- **規格**: [number.font.color.r.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/)
- **検索語**: number.font.color.r
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript.js` の `rgbFromComponents` により `number.font.color.r/g/b` を合成し、CSS 変数 `--balloon-number-color` として動的適用を実装済み。


## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:321` `// [number.font.name,フォント名], [number.font.height,数値], [number.font.color.r,数値], `
- `ui/js/core/actions/balloon-descript/font.js:335` `props["number.font.color.r"] ||`
- `tests/balloon-descript.test.js:120` `"number.font.color.r": "10",`
