# cursor.notselect.font.color.g,数値

- **規格**: [cursor.notselect.font.color.g.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/cursor.notselect.font.color.g.md)
- **検索語**: cursor.notselect.font.color.g
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyGroupProperties("cursor.notselect", "--balloon-cursor-notselect")` において `rgbFromComponents(props, "cursor.notselect.font.color")` をパースし、`--balloon-cursor-notselect-color` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js` `const col = rgbFromComponents(props, \`${prefix}.font.color\`);`
