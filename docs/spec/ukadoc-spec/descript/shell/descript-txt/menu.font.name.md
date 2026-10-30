# menu.font.name,フォント名

- **規格**: [menu.font.name.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/menu.font.name/) (ukadoc-spec/descript/shell/descript-txt/menu.font.name.md)
- **検索語**: menu.font.name
- **対応状況**: ✅ 対応済 (shell.rs)\n\n## 突合結果\n\nsrc-tauri/src/ghost/scan/shell.rs においてパース・抽出・バインドする実装が行われている。\n\n## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:193` `// [menu.font.name,フォント名], [menu.font.height,フォントサイズ]:`
- `src-tauri/src/ghost/scan/directory.rs:194` `let _menu_font_name = m.get("menu.font.name");`
- `src-tauri/src/ghost/scan/shell.rs:136` `// [menu.font.name,フォント名], [menu.font.height,フォントサイズ]:`
- `src-tauri/src/ghost/scan/shell.rs:137` `let _menu_font_name = merged.get("menu.font.name");`
