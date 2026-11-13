# font.shadowstyle,形態指定

- **規格**: [font.shadowstyle.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.shadowstyle.md)
- **検索語**: font.shadowstyle
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `props["font.shadowstyle"]` を検出し、`--balloon-font-shadow-style` カスタムプロパティ（`offset`/`outline`/`none`）を動的バインドする実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/font/base.ts:89` `if (props["font.shadowstyle"]) {`
- `tests/balloon-cycle9-robustness.test.ts:50` `it("maps outline font.shadowstyle to CSS text-shadow outline rules", () => {`
- `ui/ts/core/actions/balloon-descript/font/base.ts:90` `const shadowStyle = String(props["font.shadowstyle"]).trim();`
- `tests/balloon-cycle9-robustness.test.ts:62` `"font.shadowstyle": "outline",`
- `ui/ts/core/actions/balloon-descript/font/group.ts:6` `*  anchor.font.shadowstyle, anchor.pen.color.r/g/b, anchor.brush.color.r/g/b,`
- `tests/balloon-cycle9-robustness.test.ts:81` `it("maps underline font.shadowstyle to CSS bottom shadow rules", () => {`
