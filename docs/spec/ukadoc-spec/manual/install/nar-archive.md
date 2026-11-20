# `nar / zip / lzh / cab / exe` アーカイブ形式

- **規格**: [install.md](../../../../ukadoc-spec/manual/install.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/install/))
- **検索語**: install_ghost_archive, unlha32
- **対応状況**: ⚠️ 一部対応

## 突合結果

`.nar` および `.zip` 形式のアーカイブ展開（ファイル選択ダイアログ・パス指定・バイナリ直接指定、Zip-Slip 検証、Shift_JIS ファイル名復号、パスワード付きアーカイブ復号）およびフォルダからの `.nar` 作成（`create_nar_archive` / `create_nar_from_directory`）を実装済み。また Windows 環境向けに `expand.exe` を用いた `.cab` アーカイブ展開ヘルパー（`extract_cab_archive`）を実装済み。一方、`lzh`・自己解凍 `exe` 形式の展開は未実装であり、ファイル選択フィルタは `nar` / `zip` のみ許可し、`crates/nanai-core/src/install_protocol/helpers.rs` 等にはエラー理由定数 `"unlha32"` / `"unlha32 error"` の定義のみ存在する。

## 実装箇所

- `src-tauri/src/commands/install/mod.rs:26` `.add_filter("Ghost archive", &["nar", "zip"])`
- `src-tauri/src/commands/install/mod.rs:45` `pub async fn install_ghost_archive(`
- `src-tauri/src/commands/install/archive/mod.rs:17` `pub fn extract_ghost_archive_from_reader<R: std::io::Read + std::io::Seek>(`
- `src-tauri/src/commands/install/archive/extraction.rs:112` `pub fn extract_cab_archive(cab_path: &Path, dest_dir: &Path) -> Result<(), String> {`
- `src-tauri/src/commands/install/archive/packaging.rs:34` `pub fn create_nar_from_directory(source_dir: &Path, output_nar_path: &Path) -> Result<u64, String> {`
- `crates/nanai-core/src/install_protocol/helpers.rs:53` `} else if lower.contains("unlha32") || lower.contains("lha") {`
- `ui/ts/ghost/command-handler/media.ts:249` `await invoke("create_nar_archive", {`
- `ui/ts/core/actions/install-protocol.ts:45` `"unlha32",`
