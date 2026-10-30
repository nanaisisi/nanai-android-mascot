# cursor.notselect.font.color.b,数値

- **規格**: [cursor.notselect.font.color.b.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/cursor.notselect.font.color.b.md)
- **検索語**: cursor.notselect.font.color.b
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyGroupProperties("cursor.notselect", "--balloon-cursor-notselect")` において `rgbFromComponents(props, "cursor.notselect.font.color")` をパースし、`--balloon-cursor-notselect-color` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:282` `// [cursor.notselect.style,形状], [cursor.notselect.font.color.r,数値], [cursor.nots`
- `ui/js/core/actions/balloon-descript/font.js:287` `props["cursor.notselect.font.color.b"]`
- `tests/balloon-descript.test.js:113` `"cursor.notselect.font.color.b": "80",`
