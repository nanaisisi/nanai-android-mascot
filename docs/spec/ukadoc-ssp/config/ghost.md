# 設定：ゴースト(1)

- **規格**: [config/ghost.md](https://ukatech.shillest.net/ukadoc-ssp/config/ghost/) (ukadoc-ssp/config/ghost.md)
- **対応状況**: ✅ 実装済

## 突合結果

デフォルトゴースト設定、移動制約


## 実装箇所

- `src-tauri/src/events.rs:6` `if let Some(ghost_name) = id.strip_prefix("ghost:") {`
- `src-tauri/src/events.rs:10` `"action": "switch-to-ghost",`
- `src-tauri/src/events.rs:11` `"payload": ghost_name`
- `src-tauri/src/fmo.rs:20` `pub ghosts: HashMap<String, FmoGhostStatus>,`
- `src-tauri/src/fmo.rs:29` `.current_ghost_name`
