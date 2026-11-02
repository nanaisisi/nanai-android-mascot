# anchor.style,形状

- **規格**: [anchor.style.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/anchor.style.md)
- **検索語**: anchor.style
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyAnchorGroup("anchor", "--balloon-anchor")` において `props["anchor.style"]` を検出し、`--balloon-anchor-style` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font/group.js:5` `* UKADOC仕様 (anchor.style, anchor.blendmethod, anchor.font.color.r/g/b, anchor.fo`
- `ui/js/core/actions/balloon-descript/font/group.js:10` `* [anchor.style,形状]`
- `ui/js/core/actions/balloon-descript/font/group.js:79` `// [anchor.style / cursor.style / *.style]:`
