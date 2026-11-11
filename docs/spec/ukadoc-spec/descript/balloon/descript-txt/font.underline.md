# font.underline,0/1

- **規格**: [font.underline.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.underline.md)
- **検索語**: font.underline
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `props["font.underline"] === "1"` を検出し、`--balloon-text-decoration` カスタムプロパティ（`underline`）へ反映する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/font/base.ts:49` `props["font.underline"] === "1" ||`
- `ui/ts/core/actions/balloon-descript/font/base.ts:50` `props["font.underline"]?.toLowerCase() === "true"`
- `tests/core-actions.test.ts:37` `"font.underline": "0",`
- `tests/frontend-coverage-boost.test.ts:24` `"font.underline": "1",`
- `tests/balloon-descript/all-properties/mock-props.ts:27` `"font.underline": "1",`
