# menu.font.height,フォントサイズ

- **規格**: [menu.font.height.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/menu.font.height/) (ukadoc-spec/descript/shell/descript-txt/menu.font.height.md)
- **検索語**: menu.font.height
- **対応状況**: ✅ 対応済 (shell.rs)\n\n## 突合結果\n\nsrc-tauri/src/ghost/scan/shell.rs においてパース・抽出・バインドする実装が行われている。\n\n## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs:193` `// [menu.font.name,フォント名], [menu.font.height,フォントサイズ]:`
- `src-tauri/src/ghost/scan/directory.rs:195` `let _menu_font_height = m.get("menu.font.height");`
- `src-tauri/src/ghost/scan/shell.rs:136` `// [menu.font.name,フォント名], [menu.font.height,フォントサイズ]:`
- `src-tauri/src/ghost/scan/shell.rs:138` `let _menu_font_height = merged.get("menu.font.height");`
