# anchor.visited.style,形状

- **規格**: [anchor.visited.style.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/anchor.visited.style.md)
- **検索語**: anchor.visited.style
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `props["anchor.visited.style"]` を検出し、`--balloon-anchor-visited-style` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `tests/balloon-descript.test.js:98` `"anchor.visited.style": "underline",`
