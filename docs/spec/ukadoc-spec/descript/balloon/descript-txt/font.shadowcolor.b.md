# font.shadowcolor.b,数値

- **規格**: [font.shadowcolor.b.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.shadowcolor.b.md)
- **検索語**: font.shadowcolor.b
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "font.shadowcolor")` を通じて `font.shadowcolor.r/g/b` を抽出し、`--balloon-font-shadow-color` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font/base.js:76` `props["font.shadowcolor.b"]`
- `ui/js/core/actions/balloon-descript/font/group.js:17` `props[`${prefix}.font.shadowcolor.b`]`
- `tests/balloon-descript.test.js:92` `"font.shadowcolor.b": "200",`
