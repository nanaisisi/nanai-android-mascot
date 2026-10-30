# 設定：フォルダ

- **規格**: [config/folder.md](https://ukatech.shillest.net/ukadoc-ssp/config/folder/) (ukadoc-ssp/config/folder.md)
- **対応状況**: ✅ 実装済

## 突合結果

ゴースト・バルーン保存パス（userData/assets）管理


## 実装箇所

- `src-tauri/src/common/paths.rs:113` `let folder_name = entry.file_name().to_string_lossy().to_string();`
- `src-tauri/src/common/paths.rs:114` `if folder_name == ghost_name || folder_name == safe_ghost_name {`
- `crates/ui/src/vfs.rs:129` `let resolved = resolve_vfs_path(&temp_dir, "subfolder/target.txt");`
- `crates/ui/src/vfs.rs:150` `assert!(resolve_vfs_path(&temp_dir, "subfolder/file.txt").is_some());`
- `crates/ui/src/vfs.rs:151` `assert!(resolve_vfs_path(&temp_dir, "subfolder/nonexistent.txt").is_none());`
