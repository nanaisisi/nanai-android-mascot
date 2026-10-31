# cursor.font.color.b,数値

- **規格**: [cursor.font.color.b.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/cursor.font.color.b.md)
- **検索語**: cursor.font.color.b
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "cursor.font.color")` を通じて `cursor.font.color.r/g/b` を抽出し、`--balloon-highlight-bg` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `tests/balloon-descript.test.js:109` `"cursor.font.color.b": "0",`
- `tests/balloon-window.test.js:94` `"cursor.font.color.b": "50",`
