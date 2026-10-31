# font.color.r,数値

- **規格**: [font.color.r.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.color.r.md)
- **検索語**: font.color.r
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "font.color")` 経由で `font.color.r/g/b` を抽出し、`--balloon-text-color` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `crates/ui/src/descript/parser.rs:86` `/// バルーンフォント色 (`font.color.r,g,b` または `font.color`)`
- `ui/js/core/actions/balloon-descript/layout.js:28` `// [communicatebox.font.name,フォント名], [communicatebox.font.color.r/g/b,数値], [comm`
- `ui/js/core/actions/balloon-descript/layout.js:38` `props["communicatebox.font.color.r"] ||`
- `ui/js/core/actions/balloon-descript/font/base.js:61` `props["font.color.r"] ||`
- `ui/js/core/actions/balloon-descript/font/group.js:6` `props[`${prefix}.font.color.r`] ||`
