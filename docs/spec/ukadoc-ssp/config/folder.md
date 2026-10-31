# 設定：フォルダ

- **規格**: [config/folder.md](https://ukatech.shillest.net/ukadoc-ssp/config/folder/) (ukadoc-ssp/config/folder.md)
- **対応状況**: ✅ 実装済

## 突合結果

ゴースト・バルーン保存パス（userData/assets）管理

## 実装箇所

- `src-tauri/src/commands/install/mod.rs:91` `folder_path: String,`
- `src-tauri/src/commands/install/mod.rs:94` `println!("📦 Creating NAR archive from folder: {} -> {}", folder_path, output_nar`
- `src-tauri/src/commands/install/mod.rs:95` `let src = Path::new(&folder_path);`
- `src-tauri/src/common/paths.rs:113` `let folder_name = entry.file_name().to_string_lossy().to_string();`
- `src-tauri/src/common/paths.rs:114` `if folder_name == ghost_name || folder_name == safe_ghost_name {`
