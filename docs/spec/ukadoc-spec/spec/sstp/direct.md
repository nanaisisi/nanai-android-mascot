# sstp : Direct SSTP

- **規格**: [direct.md](https://ukatech.shillest.net/ukadoc-spec/spec/sstp/direct/) (ukadoc-spec/spec/sstp/direct.md)
- **対応状況**: ❌ 未実装

## 突合結果

SSTP 受信機能なし。

## 実装箇所

- `src-tauri/src/lib.rs:96` `commands::file::open_ghost_directory,`
- `src-tauri/src/lib.rs:106` `ghost::scan::directory::scan_ghost_directory,`
- `src-tauri/src/commands/file.rs:187` `pub fn open_ghost_directory(app_handle: tauri::AppHandle<tauri::Wry>) -> Result<`
- `src-tauri/src/commands/file.rs:192` `.map_err(|e| format!("Failed to open directory: {}", e))`
- `src-tauri/src/commands/install/utils.rs:95` `pub fn flatten_balloon_directory(target_dir: &Path) -> Result<(), String> {`
