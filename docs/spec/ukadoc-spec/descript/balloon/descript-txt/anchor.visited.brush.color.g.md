# anchor.visited.brush.color.g,数値

- **規格**: [anchor.visited.brush.color.g.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/anchor.visited.brush.color.g.md)
- **検索語**: anchor.visited.brush.color.g
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyGroupProperties("anchor.visited", "--balloon-anchor-visited")` において `rgbFromComponents(props, "anchor.visited.brush.color")` をパースし、`--balloon-anchor-visited-brush-color` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:212` `// [anchor.visited.pen.color.r,数値], [anchor.visited.pen.color.g,数値], [anchor.vis`
- `ui/js/core/actions/balloon-descript/font.js:218` `props["anchor.visited.brush.color.g"] ||`
