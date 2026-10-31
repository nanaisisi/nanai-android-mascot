# font.color.r,数値

- **規格**: [font.color.r.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/font.color.r.md)
- **検索語**: font.color.r
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `rgbFromComponents(props, "font.color")` 経由で `font.color.r/g/b` を抽出し、`--balloon-text-color` カスタムプロパティへバインドする実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/shell.rs:113` `// メニュー配色・画像情報の抽出 (menu.frame.color.r/g/b, menu.separator.color.r/g/b, menu.disa`
- `crates/ui/src/descript/parser.rs:86` `/// バルーンフォント色 (`font.color.r,g,b`または`font.color`)`
- `ui/js/core/actions/balloon-descript/font.js:73` `// [font.color.r,数値], [font.color.g,数値], [font.color.b,数値]: props["font.color.r/`
- `ui/js/core/actions/balloon-descript/font.js:76` `props["font.color.r"] ||`
- `ui/js/core/actions/balloon-descript/font.js:109` `props[`${prefix}.font.color.r`] ||`
