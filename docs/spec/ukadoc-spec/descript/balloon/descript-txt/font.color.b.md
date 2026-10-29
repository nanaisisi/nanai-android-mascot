# font.color.b,数値

- **規格**: [font.color.b.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.color.b.md)
- **検索語**: font.color.b
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "font.color")` 経由で `font.color.r/g/b` を抽出し、`--balloon-text-color` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js` `const fontColor = rgbFromComponents(props, "font.color");`
