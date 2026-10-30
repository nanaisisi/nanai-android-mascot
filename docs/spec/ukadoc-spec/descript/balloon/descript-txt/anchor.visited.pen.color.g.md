# anchor.visited.pen.color.g,数値

- **規格**: [anchor.visited.pen.color.g.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/anchor.visited.pen.color.g.md)
- **検索語**: anchor.visited.pen.color.g
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyGroupProperties("anchor.visited", "--balloon-anchor-visited")` において `rgbFromComponents(props, "anchor.visited.pen.color")` をパースし、`--balloon-anchor-visited-pen-color` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:207` `// [anchor.visited.pen.color.r,数値], [anchor.visited.pen.color.g,数値], [anchor.vis`
- `ui/js/core/actions/balloon-descript/font.js:210` `props["anchor.visited.pen.color.g"] ||`
