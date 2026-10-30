# anchor.notselect.brush.color.r,数値

- **規格**: [anchor.notselect.brush.color.r.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/anchor.notselect.brush.color.r.md)
- **検索語**: anchor.notselect.brush.color.r
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyGroupProperties("anchor.notselect", "--balloon-anchor-notselect")` において `rgbFromComponents(props, "anchor.notselect.brush.color")` をパースし、`--balloon-anchor-notselect-brush-color` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:231` `// [anchor.notselect.pen.color.r,数値], [anchor.notselect.pen.color.g,数値], [anchor`
- `ui/js/core/actions/balloon-descript/font.js:236` `props["anchor.notselect.brush.color.r"] ||`
