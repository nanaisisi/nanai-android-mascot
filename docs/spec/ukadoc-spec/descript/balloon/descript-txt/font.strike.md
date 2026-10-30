# font.strike,0/1

- **規格**: [font.strike.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.strike.md)
- **検索語**: font.strike
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `props["font.strike"] === "1"` を検出し、`--balloon-text-decoration` カスタムプロパティ（`line-through`）へ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:54` `// [font.strike,0/1]: props["font.strike"]`
- `ui/js/core/actions/balloon-descript/font.js:56` `props["font.strike"] === "1" ||`
- `ui/js/core/actions/balloon-descript/font.js:57` `props["font.strike"]?.toLowerCase() === "true"`
- `tests/balloon-descript.test.js:85` `"font.strike": "1",`
- `tests/core-actions.test.js:38` `"font.strike": "false",`
