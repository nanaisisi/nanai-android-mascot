# font.shadowcolor.r,数値

- **規格**: [font.shadowcolor.r.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.shadowcolor.r.md)
- **検索語**: font.shadowcolor.r
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "font.shadowcolor")` を通じて `font.shadowcolor.r/g/b` を抽出し、`--balloon-font-shadow-color` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font/base.js:74` `props["font.shadowcolor.r"] ||`
- `ui/js/core/actions/balloon-descript/font/group.js:15` `props[`${prefix}.font.shadowcolor.r`] ||`
- `tests/balloon-descript.test.js:90` `"font.shadowcolor.r": "200",`
