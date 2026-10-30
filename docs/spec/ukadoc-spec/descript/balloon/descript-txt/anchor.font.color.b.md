# anchor.font.color.b,数値

- **規格**: [anchor.font.color.b.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/anchor.font.color.b.md)
- **検索語**: anchor.font.color.b
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "anchor.font.color")` を通じて `anchor.font.color.r/g/b` を抽出・バインドする実装が行われている。

## 実装箇所

- `ui/js/core/actions/balloon-descript/font.js:168` `// [anchor.style,形状], [anchor.font.color.r,数値], [anchor.font.color.g,数値], [ancho`
- `ui/js/core/actions/balloon-descript/font.js:173` `props["anchor.font.color.b"]`
- `tests/balloon-descript.test.js:97` `"anchor.font.color.b": "255",`
