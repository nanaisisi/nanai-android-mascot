# font.shadowstyle,形態指定

- **規格**: [font.shadowstyle.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.shadowstyle.md)
- **検索語**: font.shadowstyle
- **対応状況**: ⚠️ 一部対応

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `props["font.shadowstyle"]` を検出し、`--balloon-font-shadow-style` カスタムプロパティ（`offset`/`outline`/`none`）を動的バインドする実装が行われている。

## 実装箇所

- `ui/ts/core/actions/balloon-descript/font/base.ts:89` `if (props["font.shadowstyle"]) {`
- `ui/ts/core/actions/balloon-descript/font/base.ts:90` `const shadowStyle = String(props["font.shadowstyle"]).trim();`
- `ui/ts/core/actions/balloon-descript/font/group.ts:6` `*  anchor.font.shadowstyle, anchor.pen.color.r/g/b, anchor.brush.color.r/g/b,`
- `ui/ts/core/actions/balloon-descript/font/group.ts:14` `* [anchor.font.shadowstyle,影の形状]`
- `ui/ts/core/actions/balloon-descript/font/group.ts:21` `* [anchor.visited.font.shadowstyle,影の形状]`
