# disable.font.(フォント定義),(指定)

- **規格**: [disable.font.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/disable.font.md)
- **検索語**: disable.font
- **対応状況**: ✅ 対応済

## 突合結果

`ui/js/core/actions/balloon-descript/font.js` の `applyFontProperties()` において `props["disable.font"]` を検出し、`--balloon-disable-font` カスタムプロパティへ反映する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/shell/theme.rs:40` `let dis_font_col = parse_color("menu.disable.font.color");`
- `ui/js/core/actions/balloon-descript/font.js:363` `// [disable.font.(フォント定義),(指定)]: props["disable.font"]`
- `ui/js/core/actions/balloon-descript/font.js:364` `const disableFont = props["disable.font"];`
