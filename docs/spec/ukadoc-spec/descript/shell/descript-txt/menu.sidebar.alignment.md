# menu.sidebar.alignment,位置

- **規格**: [menu.sidebar.alignment.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/menu.sidebar.alignment/) (ukadoc-spec/descript/shell/descript-txt/menu.sidebar.alignment.md)
- **検索語**: menu.sidebar.alignment
- **対応状況**: ✅ 対応済 (shell.rs)\n\n## 突合結果\n\nsrc-tauri/src/ghost/scan/shell.rs においてパース・抽出・バインドする実装が行われている。\n\n## 実装箇所

- `src-tauri/src/ghost/scan/shell.rs:166` `// [menu.background.alignment,位置], [menu.foreground.alignment,位置], [menu.sidebar`
- `src-tauri/src/ghost/scan/shell.rs:169` `let side_align = merged.get("menu.sidebar.alignment").cloned();`
