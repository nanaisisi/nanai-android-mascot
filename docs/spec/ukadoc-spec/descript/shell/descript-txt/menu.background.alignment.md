# menu.background.alignment,位置

- **規格**: [menu.background.alignment.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/menu.background.alignment/) (ukadoc-spec/descript/shell/descript-txt/menu.background.alignment.md)
- **検索語**: menu.background.alignment
- **対応状況**: ✅ 対応済 (shell.rs)\n\n## 突合結果\n\nsrc-tauri/src/ghost/scan/shell.rs においてパース・抽出・バインドする実装が行われている。\n\n## 実装箇所

- `src-tauri/src/ghost/scan/shell.rs:176` `// [menu.background.alignment,位置], [menu.foreground.alignment,位置], [menu.sidebar`
- `src-tauri/src/ghost/scan/shell.rs:177` `let bg_align = merged.get("menu.background.alignment").cloned();`
