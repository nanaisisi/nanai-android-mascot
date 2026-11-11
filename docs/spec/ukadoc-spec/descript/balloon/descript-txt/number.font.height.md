# number.font.height,数値

- **規格**: [number.font.height.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/)
- **検索語**: number.font.height
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript.js` にて `number.font.height` をパースし、CSS 変数 `--balloon-number-font-size` として動的適用を実装済み。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/font/special.ts:22` `const numFontHeight = parseInt(props["number.font.height"], 10);`
- `tests/balloon-descript/all-properties/mock-props.ts:76` `"number.font.height": "12",`
- `tests/core-coverage-boost/balloon-descript-coverage.test.ts:69` `"number.font.height": "24",`
