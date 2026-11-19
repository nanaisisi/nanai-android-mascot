# developer_options.txt

- **規格**: [directory.md](../../../../ukadoc-spec/manual/directory.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/directory/))
- **検索語**: developer_options.txt
- **対応状況**: ⚠️ 一部対応

## 突合結果

`docs/ukadoc-spec/manual/directory.md` の `(myghost)/developer_options.txt`（SSP 専用・NAR および更新ファイル作成設定）について、`generate_updates2_dau` が `noupdate=` 指定を解析して `updates2.dau` 生成対象から除外し、`parse_developer_options`（`filter.rs` / `crates/ui`）と `parse_developer_options_txt`（`crates/nanai-core` / WASM）、TS 側 `isNoUpdatePath` が `noupdate` パターンを扱う。一方で、`create_nar_from_directory`（`packaging.rs`）は `developer_options.txt` を動的に参照せず固定の除外配列（`IGNORE_FILE_NAMES` / `IGNORE_DIR_NAMES`）のみを適用している。

## 実装箇所

- `src-tauri/src/commands/update/generation.rs:18` `let dev_opt_path = dir.join("developer_options.txt");`
- `src-tauri/src/ghost/scan/directory/filter.rs:13` `pub fn parse_developer_options(path: &Path) {`
- `src-tauri/src/commands/install/archive/packaging.rs:11` `const IGNORE_FILE_NAMES: &[&str] = &[`
- `crates/ui/src/update/parser/developer_options.rs:4` `pub fn parse_developer_options(content: &str) -> Vec<String> {`
- `crates/nanai-core/src/update_protocol/helpers.rs:83` `pub fn parse_developer_options_txt(content: &str) -> DeveloperOptionsManifest {`
- `tests/install-update-protocol.test.ts:121` `it("identifies noupdate paths from developer_options patterns", async () => {`
