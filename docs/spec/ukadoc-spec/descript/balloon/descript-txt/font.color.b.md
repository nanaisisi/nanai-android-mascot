# font.color.b,数値

- **規格**: [font.color.b.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.color.b.md)
- **検索語**: font.color.b
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "font.color")` 経由で `font.color.r/g/b` を抽出し、`--balloon-text-color` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:73` `// [font.color.r,数値], [font.color.g,数値], [font.color.b,数値]: props["font.color.r/`
- `ui/js/core/actions/balloon-descript/font.js:78` `props["font.color.b"]`
- `ui/js/core/actions/balloon-descript/font.js:111` `props[`${prefix}.font.color.b`]`
- `ui/js/core/actions/balloon-descript/font.js:168` `// [anchor.style,形状], [anchor.font.color.r,数値], [anchor.font.color.g,数値], [ancho`
- `ui/js/core/actions/balloon-descript/font.js:173` `props["anchor.font.color.b"]`
