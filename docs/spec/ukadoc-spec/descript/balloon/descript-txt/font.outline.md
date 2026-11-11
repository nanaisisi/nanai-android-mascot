# font.outline,0/1

- **規格**: [font.outline.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.outline.md)
- **検索語**: font.outline
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `props["font.outline"] === "1"`（または `"true"`）を検出し、`--balloon-font-outline: 1` カスタムプロパティを動的設定する実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/font/base.ts:66` `props["font.outline"] === "1" ||`
- `ui/ts/core/actions/balloon-descript/font/base.ts:67` `props["font.outline"]?.toLowerCase() === "true";`
- `tests/balloon-cycle9-robustness.test.ts:99` `it("maps font.outline to --balloon-font-outline and --balloon-text-stroke", () =`
- `tests/balloon-cycle9-robustness.test.ts:110` `"font.outline": "1",`
- `tests/balloon-descript/all-properties/mock-props.ts:29` `"font.outline": "1",`
