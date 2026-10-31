# directory,ディレクトリ名

- **規格**: [directory.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/directory.md)
- **検索語**: directory
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `directory` キーをパースし、解凍先フォルダ名 (`install_directory`) へ設定する実装が行われている。

## 実装箇所

- `src-tauri/src/lib.rs:96` `commands::file::open_ghost_directory,`
- `src-tauri/src/lib.rs:107` `ghost::scan::directory::scan_ghost_directory,`
- `src-tauri/src/commands/file.rs:187` `pub fn open_ghost_directory(app_handle: tauri::AppHandle<tauri::Wry>) -> Result<`
- `src-tauri/src/commands/file.rs:192` `.map_err(|e| format!("Failed to open directory: {}", e))`
- `src-tauri/src/commands/install/utils.rs:95` `pub fn flatten_balloon_directory(target_dir: &Path) -> Result<(), String> {`
