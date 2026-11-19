# 標準的なゴーストパッケージ構成

- **規格**: [install.md](../../../../ukadoc-spec/manual/install.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/install/))
- **検索語**: extract_ghost_archive_from_reader
- **対応状況**: ✅ 実装済

## 突合結果

`(myghost)` 配下の `ghost` / `shell` / `install.txt` / `readme.txt` を含む標準ゴーストパッケージの解析・展開・作成を実装済み。`inspect_zip_archive` が `install.txt`（または `ghost/master/descript.txt`）から `type,ghost` とルート階層オフセット（`root_prefix`）を自動検出し、`assets/ghost/<dir>/` へ展開したうえで `delete.txt` 処理および `build_extracted_ghost_info` によるマニフェスト構築を行う（インストール前 `terms.txt` 確認ダイアログ中断のみ未実装）。

## 実装箇所

- `src-tauri/src/commands/install/archive/mod.rs:16` `pub fn extract_ghost_archive_from_reader<R: std::io::Read + std::io::Seek>(`
- `src-tauri/src/commands/install/archive/inspection/analyzer/zip_inspector.rs:7` `pub fn inspect_zip_archive<R: std::io::Read + std::io::Seek>(`
- `src-tauri/src/commands/install/archive/extraction.rs:9` `pub fn extract_zip_entries<R: std::io::Read + std::io::Seek>(`
- `src-tauri/src/commands/install/archive/postprocess.rs:55` `pub fn process_delete_txt(target_dir: &Path) {`
- `src-tauri/src/commands/install/archive/postprocess.rs:77` `pub fn build_extracted_ghost_info(target_dir: &Path, safe_dir_name: &str) -> GhostInfo {`
- `src-tauri/src/commands/install/archive/packaging.rs:135` `fn test_create_nar_from_directory() {`
