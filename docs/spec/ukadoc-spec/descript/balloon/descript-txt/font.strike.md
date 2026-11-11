# font.strike,0/1

- **規格**: [font.strike.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.strike.md)
- **検索語**: font.strike
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `props["font.strike"] === "1"` を検出し、`--balloon-text-decoration` カスタムプロパティ（`line-through`）へ反映する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/font/base.ts:56` `props["font.strike"] === "1" ||`
- `ui/ts/core/actions/balloon-descript/font/base.ts:57` `props["font.strike"]?.toLowerCase() === "true"`
- `tests/core-actions.test.ts:38` `"font.strike": "false",`
- `tests/frontend-coverage-boost.test.ts:25` `"font.strike": "true",`
- `tests/balloon-descript/all-properties/mock-props.ts:28` `"font.strike": "1",`
