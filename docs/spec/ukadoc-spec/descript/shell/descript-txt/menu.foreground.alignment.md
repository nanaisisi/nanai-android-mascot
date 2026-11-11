# menu.foreground.alignment,位置

- **規格**: [menu.foreground.alignment.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/menu.foreground.alignment/) (ukadoc-spec/descript/shell/descript-txt/menu.foreground.alignment.md)
- **検索語**: menu.foreground.alignment
- **対応状況**: ⚠️ 一部対応

## 突合結果

src-tauri/src/ghost/scan/shell.rs においてパース・抽出・バインドする実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/shell/theme.rs:53` `let fg_align = merged.get("menu.foreground.alignment").cloned();`
