# anchor.visited.font.color.g,数値

- **規格**: [anchor.visited.font.color.g.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/anchor.visited.font.color.g.md)
- **検索語**: anchor.visited.font.color.g
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "anchor.visited.font.color")` を通じて `anchor.visited.font.color.r/g/b` を抽出・バインドする実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:196` `// [anchor.visited.style,形状], [anchor.visited.font.color.r,数値], [anchor.visited.`
- `ui/js/core/actions/balloon-descript/font.js:200` `props["anchor.visited.font.color.g"] ||`
- `tests/balloon-descript.test.js:100` `"anchor.visited.font.color.g": "0",`
