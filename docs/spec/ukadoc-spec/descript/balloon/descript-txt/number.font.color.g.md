# number.font.color.g,数値

- **規格**: [number.font.color.g.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/)
- **検索語**: number.font.color.g
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript.js` の `rgbFromComponents` により `number.font.color.r/g/b` を合成し、CSS 変数 `--balloon-number-color` として動的適用を実装済み。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/font/special.ts:29` `props["number.font.color.g"] ||`
- `tests/balloon-descript/all-properties/mock-props.ts:78` `"number.font.color.g": "10",`
- `tests/core-coverage-boost/balloon-descript-coverage.test.ts:71` `"number.font.color.g": "150",`
