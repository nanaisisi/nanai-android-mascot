# menu.foreground.alignment,位置

- **規格**: [menu.foreground.alignment.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/menu.foreground.alignment/) (ukadoc-spec/descript/shell/descript-txt/menu.foreground.alignment.md)
- **検索語**: menu.foreground.alignment
- **対応状況**: ✅ 対応済 (shell.rs)\n\n## 突合結果\n\nsrc-tauri/src/ghost/scan/shell.rs においてパース・抽出・バインドする実装が行われている。\n\n## 実装箇所\n\n- src-tauri/src/ghost/scan/shell.rs // [name,シェル名]... [type,種別]... [char*.name,名前]...

## 突合結果

実装コード内に「menu.foreground.alignment」を確認。


## 実装箇所

- `src-tauri/src/ghost/scan/shell.rs:139` `let fg_align = merged.get("menu.foreground.alignment").cloned();`
