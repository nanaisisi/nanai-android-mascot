# font.color.g,数値

- **規格**: [font.color.g.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.color.g.md)
- **検索語**: font.color.g
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "font.color")` 経由で `font.color.r/g/b` を抽出し、`--balloon-text-color` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:73` `// [font.color.r,数値], [font.color.g,数値], [font.color.b,数値]: props["font.color.r/`
- `ui/js/core/actions/balloon-descript/font.js:77` `props["font.color.g"] ||`
- `ui/js/core/actions/balloon-descript/font.js:110` `props[`${prefix}.font.color.g`] ||`
- `ui/js/core/actions/balloon-descript/font.js:168` `// [anchor.style,形状], [anchor.font.color.r,数値], [anchor.font.color.g,数値], [ancho`
- `ui/js/core/actions/balloon-descript/font.js:172` `props["anchor.font.color.g"] ||`
