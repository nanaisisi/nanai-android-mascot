# ディレクトリ構成 (manual/directory.md)

- **規格**: [manual/directory.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/directory.md)
- **対応状況**: ✅ 対応済 (実ファイルハンドリング実装済)

## 実ファイルハンドリング突合結果

- **VFS (仮想ファイルシステム) と大文字小文字の吸収**: `resolve_vfs_path` により、Windows / Android 間やゴーストフォルダ内の大文字小文字の違いを完全に吸収して実ファイルを探索。
- **優先順位付き走査 (`userData/ghost` vs `local/ghost`)**: `scan_ghost_directory` において `userData/ghost` を優先しつつ、内蔵アセットをフォールバックとして走査する仕組みを実装 (`src-tauri/src/ghost/scan/directory.rs`)。

## 実装箇所

- `src-tauri/src/lib.rs:96` `commands::file::open_ghost_directory,`
- `src-tauri/src/lib.rs:107` `ghost::scan::directory::scan_ghost_directory,`
- `src-tauri/src/commands/file.rs:187` `pub fn open_ghost_directory(app_handle: tauri::AppHandle<tauri::Wry>) -> Result<`
- `src-tauri/src/commands/file.rs:192` `.map_err(|e| format!("Failed to open directory: {}", e))`
- `src-tauri/src/commands/install/utils.rs:95` `pub fn flatten_balloon_directory(target_dir: &Path) -> Result<(), String> {`
