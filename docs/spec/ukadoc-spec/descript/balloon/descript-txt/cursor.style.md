# cursor.style,形状

- **規格**: [cursor.style.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/cursor.style.md)
- **検索語**: cursor.style
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyAnchorGroup("cursor", "--balloon-cursor")` において `props["cursor.style"]` を検出し、`--balloon-cursor-style` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:245` `// [cursor.style,形状], [cursor.blendmethod,コマンド], [cursor.font.color.r,数値], [curs`
- `ui/js/core/actions/balloon-descript/font.js:247` `props["cursor.style"] ||`
- `tests/balloon-descript.test.js:100` `"cursor.style": "square",`
