# cursor.notselect.font.shadowstyle,形態指定

- **規格**: [cursor.notselect.font.shadowstyle.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/cursor.notselect.font.shadowstyle.md)
- **検索語**: cursor.notselect.font.shadowstyle
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyGroupProperties("cursor.notselect", "--balloon-cursor-notselect")` において `props["cursor.notselect.font.shadowstyle"]` を検出し、`--balloon-cursor-notselect-shadow-style` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:277` `// [cursor.notselect.font.shadowcolor.r,数値], [cursor.notselect.font.shadowcolor.`
- `ui/js/core/actions/balloon-descript/font.js:282` `props["cursor.notselect.font.shadowstyle"]`
