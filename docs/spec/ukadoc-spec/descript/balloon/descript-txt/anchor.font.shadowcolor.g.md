# anchor.font.shadowcolor.g,数値

- **規格**: [anchor.font.shadowcolor.g.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/anchor.font.shadowcolor.g.md)
- **検索語**: anchor.font.shadowcolor.g
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` 内 `applyAnchorGroup("anchor", "--balloon-anchor")` において `rgbFromComponents(props, "anchor.font.shadowcolor")` をパースし、`--balloon-anchor-shadow-color` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js` `const shadowCol = rgbFromComponents(props, \`${prefix}.font.shadowcolor\`);`
