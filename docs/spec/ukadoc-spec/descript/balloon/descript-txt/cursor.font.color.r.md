# cursor.font.color.r,数値

- **規格**: [cursor.font.color.r.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/cursor.font.color.r.md)
- **検索語**: cursor.font.color.r
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "cursor.font.color")` を通じて `cursor.font.color.r/g/b` を抽出し、`--balloon-highlight-bg` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font/group.js:34` `* [cursor.font.color.r,数値], [cursor.font.color.g,数値], [cursor.font.color.b,数値]`
