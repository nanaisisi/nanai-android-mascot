# filename,dll

- **規格**: [filename.md](https://ukatech.shillest.net/ukadoc-spec/descript/plugin/descript-txt/) (ukadoc-spec/descript/plugin/descript-txt/filename.md)
- **検索語**: filename
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/commands/ext.rs` において `filename` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/shell/theme.rs:43` `.get("menu.background.bitmap.filename")`
- `src-tauri/src/ghost/scan/shell/theme.rs:46` `.get("menu.foreground.bitmap.filename")`
- `src-tauri/src/ghost/scan/shell/theme.rs:49` `.get("menu.sidebar.bitmap.filename")`
- `crates/ui/src/script/command.rs:123` `filename: String,`
- `crates/ui/src/script/command.rs:138` `filename: String,`
