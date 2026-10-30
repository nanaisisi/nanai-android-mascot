# disable.font.(フォント定義),(指定)

- **規格**: [disable.font.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/disable.font.md)
- **検索語**: disable.font
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `props["disable.font"]` を検出し、`--balloon-disable-font` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/shell.rs:113` `// メニュー配色・画像情報の抽出 (menu.frame.color.r/g/b, menu.separator.color.r/g/b, menu.disa`
- `src-tauri/src/ghost/scan/shell.rs:146` `let dis_font_col = parse_color("menu.disable.font.color");`
- `ui/js/core/actions/balloon-descript/font.js:348` `// [disable.font.(フォント定義),(指定)]: props["disable.font"]`
- `ui/js/core/actions/balloon-descript/font.js:349` `const disableFont = props["disable.font"];`
