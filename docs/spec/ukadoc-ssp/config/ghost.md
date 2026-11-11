# 設定：ゴースト(1)

- **規格**: [config/ghost.md](https://ukatech.shillest.net/ukadoc-ssp/config/ghost/) (ukadoc-ssp/config/ghost.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

デフォルトゴースト設定、移動制約

## 実装箇所

- `src-tauri/shiori-host/src/main.rs:259` `let p = std::path::Path::new("ghost/master");`
- `src-tauri/src/events.rs:6` `if let Some(ghost_name) = id.strip_prefix("ghost:") {`
- `src-tauri/src/events.rs:10` `"action": "switch-to-ghost",`
- `src-tauri/src/lib.rs:22` `mod ghost;`
- `src-tauri/src/lib.rs:126` `ghost::scan::directory::scan_ghost_directory,`
