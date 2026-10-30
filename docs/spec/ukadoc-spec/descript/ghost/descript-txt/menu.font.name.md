# menu.font.name,フォント名

- **規格**: [menu.font.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/menu.font.name.md)
- **検索語**: menu.font.name
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `menu.font.name` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:193` `// [menu.font.name,フォント名], [menu.font.height,フォントサイズ]:`
- `src-tauri/src/ghost/scan/directory.rs:194` `let _menu_font_name = m.get("menu.font.name");`
- `src-tauri/src/ghost/scan/shell.rs:136` `// [menu.font.name,フォント名], [menu.font.height,フォントサイズ]:`
- `src-tauri/src/ghost/scan/shell.rs:137` `let _menu_font_name = merged.get("menu.font.name");`
