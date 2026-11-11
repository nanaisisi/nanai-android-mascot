# directory,ディレクトリ名

- **規格**: [directory.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/directory.md)
- **検索語**: directory
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `directory` キーをパースし、解凍先フォルダ名 (`install_directory`) へ設定する実装が行われている。

## 実装箇所

- `src-tauri/src/lib.rs:126` `ghost::scan::directory::scan_ghost_directory,`
- `src-tauri/src/commands/file.rs:240` `.map_err(|e| format!("Failed to open directory: {}", e))`
- `src-tauri/src/commands/install/utils.rs:97` `.map_err(|e| format!("Failed to inspect balloon directory: {e}"))?`
- `src-tauri/src/commands/install/archive/packaging.rs:25` `"Source path '{}' is not a directory",`
- `src-tauri/src/commands/install/archive/packaging.rs:32` `.map_err(|e| format!("Failed to create output directory for nar: {e}"))?;`
