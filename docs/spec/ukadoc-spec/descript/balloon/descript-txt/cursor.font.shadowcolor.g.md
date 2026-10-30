# cursor.font.shadowcolor.g,数値

- **規格**: [cursor.font.shadowcolor.g.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/cursor.font.shadowcolor.g.md)
- **検索語**: cursor.font.shadowcolor.g
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyGroupProperties("cursor", "--balloon-cursor")` において `rgbFromComponents(props, "cursor.font.shadowcolor")` をパースし、`--balloon-cursor-shadow-color` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:253` `// [cursor.font.shadowcolor.r,数値], [cursor.font.shadowcolor.g,数値], [cursor.font.`
- `ui/js/core/actions/balloon-descript/font.js:256` `props["cursor.font.shadowcolor.g"] ||`
