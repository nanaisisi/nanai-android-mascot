# anchor.visited.font.color.b,数値

- **規格**: [anchor.visited.font.color.b.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/anchor.visited.font.color.b.md)
- **検索語**: anchor.visited.font.color.b
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "anchor.visited.font.color")` を通じて `anchor.visited.font.color.r/g/b` を抽出・バインドする実装が行われている。

## 実装箇所

- `tests/balloon-descript.test.js:101` `"anchor.visited.font.color.b": "128",`
