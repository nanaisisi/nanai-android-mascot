# number.font.color.g,数値

- **規格**: [number.font.color.g.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/)
- **検索語**: number.font.color.g
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript.js` の `rgbFromComponents` により `number.font.color.r/g/b` を合成し、CSS 変数 `--balloon-number-color` として動的適用を実装済み。


## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:306` `// [number.font.name,フォント名], [number.font.height,数値], [number.font.color.r,数値], `
- `ui/js/core/actions/balloon-descript/font.js:321` `props["number.font.color.g"] ||`
- `tests/balloon-descript.test.js:115` `"number.font.color.g": "10",`
