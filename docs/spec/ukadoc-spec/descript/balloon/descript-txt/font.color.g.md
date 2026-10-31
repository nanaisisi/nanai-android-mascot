# font.color.g,数値

- **規格**: [font.color.g.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.color.g.md)
- **検索語**: font.color.g
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "font.color")` 経由で `font.color.r/g/b` を抽出し、`--balloon-text-color` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/layout.js:39` `props["communicatebox.font.color.g"] ||`
- `ui/js/core/actions/balloon-descript/font/base.js:62` `props["font.color.g"] ||`
- `ui/js/core/actions/balloon-descript/font/group.js:7` `props[`${prefix}.font.color.g`] ||`
- `ui/js/core/actions/balloon-descript/font/special.js:29` `props["number.font.color.g"] ||`
- `ui/js/core/actions/balloon-descript/font/special.js:49` `props["sstpmessage.font.color.g"] ||`
