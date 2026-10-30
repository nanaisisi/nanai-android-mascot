# cursor.font.color.g,数値

- **規格**: [cursor.font.color.g.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/cursor.font.color.g.md)
- **検索語**: cursor.font.color.g
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "cursor.font.color")` を通じて `cursor.font.color.r/g/b` を抽出し、`--balloon-highlight-bg` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:254` `// [cursor.style,形状], [cursor.blendmethod,コマンド], [cursor.font.color.r,数値], [curs`
- `ui/js/core/actions/balloon-descript/font.js:259` `props["cursor.font.color.g"] ||`
- `tests/balloon-descript.test.js:108` `"cursor.font.color.g": "0",`
- `tests/balloon-window.test.js:93` `"cursor.font.color.g": "50",`
