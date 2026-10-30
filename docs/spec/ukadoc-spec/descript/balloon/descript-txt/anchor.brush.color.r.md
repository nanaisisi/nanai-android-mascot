# anchor.brush.color.r,数値

- **規格**: [anchor.brush.color.r.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/anchor.brush.color.r.md)
- **検索語**: anchor.brush.color.r
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyAnchorGroup("anchor", "--balloon-anchor")` において `rgbFromComponents(props, "anchor.brush.color")` をパースし、`--balloon-anchor-brush-color` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:184` `// [anchor.pen.color.r,数値], [anchor.pen.color.g,数値], [anchor.pen.color.b,数値], [a`
- `ui/js/core/actions/balloon-descript/font.js:189` `props["anchor.brush.color.r"] ||`
