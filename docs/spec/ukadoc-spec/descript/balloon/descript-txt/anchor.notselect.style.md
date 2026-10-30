# anchor.notselect.style,形状

- **規格**: [anchor.notselect.style.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/anchor.notselect.style.md)
- **検索語**: anchor.notselect.style
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `props["anchor.notselect.style"]` を検出し、`--balloon-anchor-notselect-style` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:223` `// [anchor.notselect.style,形状], [anchor.notselect.font.color.r,数値], [anchor.nots`
- `ui/js/core/actions/balloon-descript/font.js:225` `props["anchor.notselect.style"] ||`
- `tests/balloon-descript.test.js:102` `"anchor.notselect.style": "none",`
