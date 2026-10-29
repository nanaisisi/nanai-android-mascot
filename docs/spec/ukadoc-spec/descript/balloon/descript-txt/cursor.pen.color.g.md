# cursor.pen.color.g,数値

- **規格**: [cursor.pen.color.g.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/cursor.pen.color.g.md)
- **検索語**: cursor.pen.color.g
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyGroupProperties("cursor", "--balloon-cursor")` において `rgbFromComponents(props, "cursor.pen.color")` をパースし、`--balloon-cursor-pen-color` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js` `const penCol = rgbFromComponents(props, \`${prefix}.pen.color\`);`
