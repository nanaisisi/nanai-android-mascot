# cursor.font.shadowstyle,形態指定

- **規格**: [cursor.font.shadowstyle.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/cursor.font.shadowstyle.md)
- **検索語**: cursor.font.shadowstyle
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyGroupProperties("cursor", "--balloon-cursor")` において `props["cursor.font.shadowstyle"]` を検出し、`--balloon-cursor-shadow-style` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:263` `// [cursor.font.shadowcolor.r,数値], [cursor.font.shadowcolor.g,数値], [cursor.font.`
- `ui/js/core/actions/balloon-descript/font.js:268` `props["cursor.font.shadowstyle"]`
