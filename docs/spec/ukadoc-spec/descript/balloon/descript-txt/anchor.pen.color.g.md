# anchor.pen.color.g,数値

- **規格**: [anchor.pen.color.g.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/anchor.pen.color.g.md)
- **検索語**: anchor.pen.color.g
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyAnchorGroup("anchor", "--balloon-anchor")` において `rgbFromComponents(props, "anchor.pen.color")` をパースし、`--balloon-anchor-pen-color` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:184` `// [anchor.pen.color.r,数値], [anchor.pen.color.g,数値], [anchor.pen.color.b,数値], [a`
- `ui/js/core/actions/balloon-descript/font.js:187` `props["anchor.pen.color.g"] ||`
