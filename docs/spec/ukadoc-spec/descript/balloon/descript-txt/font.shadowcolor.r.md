# font.shadowcolor.r,数値

- **規格**: [font.shadowcolor.r.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.shadowcolor.r.md)
- **検索語**: font.shadowcolor.r
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "font.shadowcolor")` を通じて `font.shadowcolor.r/g/b` を抽出し、`--balloon-font-shadow-color` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:87` `// [font.shadowcolor.r,数値], [font.shadowcolor.g,数値], [font.shadowcolor.b,数値], [f`
- `ui/js/core/actions/balloon-descript/font.js:90` `props["font.shadowcolor.r"] ||`
- `ui/js/core/actions/balloon-descript/font.js:118` `props[`${prefix}.font.shadowcolor.r`] ||`
- `ui/js/core/actions/balloon-descript/font.js:176` `// [anchor.font.shadowcolor.r,数値], [anchor.font.shadowcolor.g,数値], [anchor.font.`
- `ui/js/core/actions/balloon-descript/font.js:178` `props["anchor.font.shadowcolor.r"] ||`
