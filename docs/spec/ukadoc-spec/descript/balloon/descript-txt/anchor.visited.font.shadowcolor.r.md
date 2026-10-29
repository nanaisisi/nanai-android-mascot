# anchor.visited.font.shadowcolor.r,数値

- **規格**: [anchor.visited.font.shadowcolor.r.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/anchor.visited.font.shadowcolor.r.md)
- **検索語**: anchor.visited.font.shadowcolor.r
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyGroupProperties("anchor.visited", "--balloon-anchor-visited")` において `rgbFromComponents(props, "anchor.visited.font.shadowcolor")` をパースし、`--balloon-anchor-visited-shadow-color` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js` `const shadowCol = rgbFromComponents(props, \`${prefix}.font.shadowcolor\`);`
