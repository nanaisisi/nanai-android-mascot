# anchor.visited.font.color.r,数値

- **規格**: [anchor.visited.font.color.r.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/anchor.visited.font.color.r.md)
- **検索語**: anchor.visited.font.color.r
- **対応状況**: ✅ 実装済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "anchor.visited.font.color")` を通じて `anchor.visited.font.color.r/g/b` を抽出・バインドする実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font/group.js:19` `* [anchor.visited.font.color.r,数値], [anchor.visited.font.color.g,数値], [anchor.vi`
