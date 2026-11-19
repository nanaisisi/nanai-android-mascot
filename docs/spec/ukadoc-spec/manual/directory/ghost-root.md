# (myghost)/ ゴーストホームディレクトリ

- **規格**: [directory.md](../../../../ukadoc-spec/manual/directory.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/directory/))
- **検索語**: scan_ghost_directory, resolve_ghost_directory
- **対応状況**: ✅ 実装済

## 突合結果

`docs/ukadoc-spec/manual/directory.md` の `(myghost)/`（各ゴーストのホームディレクトリ／ルートフォルダ）に対応し、`scan_ghost_directory` が `userData/ghost/`・`ghost/`・指定アセットディレクトリ配下のサブディレクトリ（`.` 始まりを除く）を並列走査し、`resolve_ghost_directory` がフォルダ名・`descript.txt` / `install.txt` の `name` / `directory` キーからルートディレクトリを解決する。インストール時は `extract_ghost_archive_from_reader` が `(myghost)/` を展開先ルートとして構築し、アンインストール時は `uninstall_ghost` がディレクトリ全体を削除する。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/scan.rs:14` `pub async fn scan_ghost_directory(`
- `src-tauri/src/ghost/scan/directory/scan.rs:41` `for scan_dir in paths_to_scan {`
- `src-tauri/src/common/paths.rs:121` `pub fn resolve_ghost_directory(`
- `src-tauri/src/commands/install/archive/mod.rs:16` `pub fn extract_ghost_archive_from_reader<R: std::io::Read + std::io::Seek>(`
- `src-tauri/src/commands/shell/ghost.rs:59` `pub async fn uninstall_ghost(`
