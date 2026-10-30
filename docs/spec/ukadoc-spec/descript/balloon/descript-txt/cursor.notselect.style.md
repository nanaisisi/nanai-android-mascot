# cursor.notselect.style,形状

- **規格**: [cursor.notselect.style.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/cursor.notselect.style.md)
- **検索語**: cursor.notselect.style
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyGroupProperties("cursor.notselect", "--balloon-cursor-notselect")` において `props["cursor.notselect.style"]` を検出し、`--balloon-cursor-notselect-style` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:270` `// [cursor.notselect.style,形状], [cursor.notselect.font.color.r,数値], [cursor.nots`
- `ui/js/core/actions/balloon-descript/font.js:272` `props["cursor.notselect.style"] ||`
- `tests/balloon-descript.test.js:104` `"cursor.notselect.style": "none",`
