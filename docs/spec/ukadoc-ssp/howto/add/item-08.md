# その他の追加

- **規格**: [add.md](../../../../ukadoc-ssp/howto/add.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/howto/add/))
- **検索語**: install_ghost_archive
- **対応状況**: ⚠️ 一部対応

## 突合結果

.nar / .zip のドラッグ＆ドロップ、ファイル選択、Ghost/Balloon 自動仕分け。


## 実装箇所

- `src-tauri/src/invoke.rs:92` `commands::install::install_ghost_archive,`
- `src-tauri/src/commands/install/mod.rs:38` `install_ghost_archive(path.to_string_lossy().to_string(), password, app_handle)`
- `src-tauri/src/commands/install/mod.rs:45` `pub async fn install_ghost_archive(`
