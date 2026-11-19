# `install.txt`

- **規格**: [install.md](../../../../ukadoc-spec/manual/install.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/install/))
- **検索語**: parse_install_manifest
- **対応状況**: ✅ 実装済

## 突合結果

ZIP エントリ解析の `parse_zip_entry_descript` および `inspect_zip_archive` により `name` / `type` / `directory` / `accept` / `bootghost` / `refresh` / `refreshundeletemask` / 同梱リソース設定を解析し、`perform_refresh_cleanup` 等で展開処理へ適用する。さらに `crates/ui/src/update/parser/install_manifest.rs` の `parse_install_manifest` が `charset` / `notice` / `readme` / `execute` / `oninstall.script` / `onuninstall.script` まで `InstallManifest` として解析・テスト済み（`accept`・`bootghost` の展開後自動適用のみ未接続）。

## 実装箇所

- `src-tauri/src/commands/install/utils.rs:12` `pub fn parse_zip_entry_descript(`
- `src-tauri/src/commands/install/archive/inspection/analyzer/zip_inspector.rs:56` `let map = parse_zip_entry_descript(&mut entry);`
- `src-tauri/src/commands/install/archive/postprocess.rs:6` `pub fn perform_refresh_cleanup(target_dir: &Path, undelete_mask: &[String]) {`
- `crates/ui/src/update/parser/install_manifest.rs:7` `pub fn parse_install_manifest(content: &str) -> InstallManifest {`
- `crates/ui/src/update/types/install.rs:50` `pub struct InstallManifest {`
- `crates/ui/src/update/tests/installer_manifest.rs:21` `fn test_installer_engine_and_manifest_parsing() {`
