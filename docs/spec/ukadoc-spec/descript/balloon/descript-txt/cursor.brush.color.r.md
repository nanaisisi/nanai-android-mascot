# cursor.brush.color.r,数値

- **規格**: [cursor.brush.color.r.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/cursor.brush.color.r.md)
- **検索語**: cursor.brush.color.r
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyGroupProperties("cursor", "--balloon-cursor")` において `rgbFromComponents(props, "cursor.brush.color")` をパースし、`--balloon-cursor-brush-color` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js` `const brushCol = rgbFromComponents(props, \`${prefix}.brush.color\`);`
