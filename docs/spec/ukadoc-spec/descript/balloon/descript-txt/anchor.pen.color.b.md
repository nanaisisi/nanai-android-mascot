# anchor.pen.color.b,数値

- **規格**: [anchor.pen.color.b.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/anchor.pen.color.b.md)
- **検索語**: anchor.pen.color.b
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyAnchorGroup("anchor", "--balloon-anchor")` において `rgbFromComponents(props, "anchor.pen.color")` をパースし、`--balloon-anchor-pen-color` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js` `const penCol = rgbFromComponents(props, \`${prefix}.pen.color\`);`
