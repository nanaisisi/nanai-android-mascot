# directory,ディレクトリ名

- **規格**: [directory.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/directory/) (ukadoc-spec/descript/install/install-txt/directory.md)
- **検索語**: directory
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「directory」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/lib.rs:94` `commands::file::open_ghost_directory,`
- `src-tauri/src/lib.rs:104` `ghost::scan::directory::scan_ghost_directory,`
- `src-tauri/src/commands/file.rs:187` `pub fn open_ghost_directory(app_handle: tauri::AppHandle<tauri::Wry>) -> Result<`
- `src-tauri/src/commands/file.rs:192` `.map_err(|e| format!("Failed to open directory: {}", e))`
- `src-tauri/src/commands/shiori/status.rs:2` `use crate::ghost::scan::{ScanResult, scan_ghost_directory};`
