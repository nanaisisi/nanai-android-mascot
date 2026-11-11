# menu.sidebar.alignment,位置

- **規格**: [menu.sidebar.alignment.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/menu.sidebar.alignment/) (ukadoc-spec/descript/shell/descript-txt/menu.sidebar.alignment.md)
- **検索語**: menu.sidebar.alignment
- **対応状況**: ⚠️ 一部対応

## 突合結果

src-tauri/src/ghost/scan/shell.rs においてパース・抽出・バインドする実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/shell/theme.rs:54` `let side_align = merged.get("menu.sidebar.alignment").cloned();`
