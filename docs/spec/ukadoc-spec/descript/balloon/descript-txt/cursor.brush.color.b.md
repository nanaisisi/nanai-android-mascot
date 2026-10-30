# cursor.brush.color.b,数値

- **規格**: [cursor.brush.color.b.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/cursor.brush.color.b.md)
- **検索語**: cursor.brush.color.b
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyGroupProperties("cursor", "--balloon-cursor")` において `rgbFromComponents(props, "cursor.brush.color")` をパースし、`--balloon-cursor-brush-color` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:271` `// [cursor.pen.color.r,数値], [cursor.pen.color.g,数値], [cursor.pen.color.b,数値], [c`
- `ui/js/core/actions/balloon-descript/font.js:278` `props["cursor.brush.color.b"]`
