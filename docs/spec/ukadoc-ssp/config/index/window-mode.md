# ウインドウモード

- **規格**: [index.md](../../../../ukadoc-ssp/config/index.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/index/))
- **検索語**: window_mode
- **対応状況**: ⚠️ 一部対応

## 突合結果

ウインドウモード切替は未実装。


## 実装箇所

- `src-tauri/src/common/state.rs:7` `pub(crate) window_mode: Mutex<String>,`
- `src-tauri/src/common/state.rs:25` `window_mode: Mutex::new("normal".to_string()),`
- `src-tauri/src/common/state.rs:45` `pub fn window_mode(&self) -> &Mutex<String> {`
- `src-tauri/src/common/state.rs:46` `&self.window_mode`
- `src-tauri/src/shiori/property/mod.rs:92` `let win_mode_guard = state.window_mode.lock();`
