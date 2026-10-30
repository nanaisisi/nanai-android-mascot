# anchor.visited.font.shadowstyle,形態指定

- **規格**: [anchor.visited.font.shadowstyle.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/anchor.visited.font.shadowstyle.md)
- **検索語**: anchor.visited.font.shadowstyle
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyGroupProperties("anchor.visited", "--balloon-anchor-visited")` において `props["anchor.visited.font.shadowstyle"]` を検出し、`--balloon-anchor-visited-shadow-style` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:204` `// [anchor.visited.font.shadowcolor.r,数値], [anchor.visited.font.shadowcolor.g,数値`
- `ui/js/core/actions/balloon-descript/font.js:209` `props["anchor.visited.font.shadowstyle"]`
