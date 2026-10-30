# font.shadowcolor.g,数値

- **規格**: [font.shadowcolor.g.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.shadowcolor.g.md)
- **検索語**: font.shadowcolor.g
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "font.shadowcolor")` を通じて `font.shadowcolor.r/g/b` を抽出し、`--balloon-font-shadow-color` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:87` `// [font.shadowcolor.r,数値], [font.shadowcolor.g,数値], [font.shadowcolor.b,数値], [f`
- `ui/js/core/actions/balloon-descript/font.js:91` `props["font.shadowcolor.g"] ||`
- `ui/js/core/actions/balloon-descript/font.js:119` `props[`${prefix}.font.shadowcolor.g`] ||`
- `ui/js/core/actions/balloon-descript/font.js:176` `// [anchor.font.shadowcolor.r,数値], [anchor.font.shadowcolor.g,数値], [anchor.font.`
- `ui/js/core/actions/balloon-descript/font.js:179` `props["anchor.font.shadowcolor.g"] ||`
