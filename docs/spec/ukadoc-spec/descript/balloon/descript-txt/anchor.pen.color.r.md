# anchor.pen.color.r,数値

- **規格**: [anchor.pen.color.r.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/anchor.pen.color.r.md)
- **検索語**: anchor.pen.color.r
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyAnchorGroup("anchor", "--balloon-anchor")` において `rgbFromComponents(props, "anchor.pen.color")` をパースし、`--balloon-anchor-pen-color` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font/group.js:6` `*  anchor.font.shadowstyle, anchor.pen.color.r/g/b, anchor.brush.color.r/g/b,`
- `ui/js/core/actions/balloon-descript/font/group.js:15` `* [anchor.pen.color.r,数値], [anchor.pen.color.g,数値], [anchor.pen.color.b,数値]`
