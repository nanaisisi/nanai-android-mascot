# font.shadowstyle,形態指定

- **規格**: [font.shadowstyle.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.shadowstyle.md)
- **検索語**: font.shadowstyle
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `props["font.shadowstyle"]` を検出し、`--balloon-font-shadow-style` カスタムプロパティ（`offset`/`outline`/`none`）を動的バインドする実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font/base.js:82` `if (props["font.shadowstyle"]) {`
- `ui/js/core/actions/balloon-descript/font/base.js:85` `props["font.shadowstyle"],`
- `ui/js/core/actions/balloon-descript/font/group.js:23` `if (props[`${prefix}.font.shadowstyle`]) {`
- `ui/js/core/actions/balloon-descript/font/group.js:26` `props[`${prefix}.font.shadowstyle`],`
