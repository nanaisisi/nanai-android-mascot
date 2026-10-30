# インストール (manual/install.md)

- **規格**: [manual/install.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/install.md)
- **対応状況**: ✅ 対応済 (実ファイルハンドリング実装済)

## 実ファイルハンドリング突合結果

- **NAR / ZIP アーカイブ展開**: `.nar` および `.zip` ファイルの解凍時に ZipSlip 脆弱性を防ぐ安全なパス検証を実装。
- **タイプ別仕分け**: `install.txt` の `type` ディレクティブ（`ghost`, `balloon` 等）を解析し、適切なアセットフォルダ（`assets/ghost/`, `assets/balloon/`）へ実ファイルを展開 (`src-tauri/src/commands/install/`)。


## 実装箇所

- `src-tauri/src/lib.rs:104` `commands::shell::uninstall_ghost,`
- `src-tauri/src/lib.rs:145` `commands::install::pick_and_install_ghost_archive,`
- `src-tauri/src/lib.rs:146` `commands::install::install_ghost_archive,`
- `src-tauri/src/lib.rs:147` `commands::install::install_ghost_archive_bytes,`
- `src-tauri/src/commands/mod.rs:5` `pub mod install;`
