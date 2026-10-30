# anchor.font.shadowstyle,形態指定

- **規格**: [anchor.font.shadowstyle.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/anchor.font.shadowstyle.md)
- **検索語**: anchor.font.shadowstyle
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyAnchorGroup("anchor", "--balloon-anchor")` において `props["anchor.font.shadowstyle"]` を検出し、`--balloon-anchor-shadow-style` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:176` `// [anchor.font.shadowcolor.r,数値], [anchor.font.shadowcolor.g,数値], [anchor.font.`
- `ui/js/core/actions/balloon-descript/font.js:181` `props["anchor.font.shadowstyle"]`
