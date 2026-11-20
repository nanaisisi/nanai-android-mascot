# developer_options.txt

- **規格**: [update.md](../../../../ukadoc-spec/manual/update.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/update/))
- **検索語**: developer_options.txt, parse_developer_options, isNoUpdatePath
- **対応状況**: ✅ 実装済

## 突合結果

SSP 独自の `developer_options.txt` について、`generate_updates2_dau`（`src-tauri/src/commands/update/generation.rs:18-29,50-59`）で `noupdate=` 指定パターンを `updates2.dau` 生成対象から除外する処理、ネットワーク更新チェック（`check_dir_update`、`src-tauri/src/commands/update/network/commands/check.rs:63`）で `read_noupdate_patterns` / `is_noupdate_excluded`（`src-tauri/src/commands/update/network/helpers.rs:78`）を用いて更新対象から除外する処理、およびディレクトリ走査時のログ出力（`src-tauri/src/ghost/scan/directory/filter.rs:13-24`）を実装している。パーサーと除外判定ヘルパーは `crates/ui/src/update/parser/developer_options.rs:4-26`（`noupdate=` / `noupdate,` / `noupdate:` 対応）、`crates/ui/src/update/types/package.rs:192-204`（`filter_noupdate`）、`crates/nanai-core/src/update_protocol/helpers.rs:83-108,146-149`（`parse_developer_options_txt` / `is_no_update_path`）、およびフロントエンド（`ui/ts/core/actions/update-protocol.ts:90-118`・`ui/ts/core/wasm/wasm-protocol.ts:288-302`）に実装され、`src-tauri/src/commands/update/network/helpers.rs:185`（`test_read_noupdate_patterns_and_exclusion`）・`crates/ui/src/update/tests/installer_manifest.rs:173`・`crates/nanai-core/src/update_protocol/tests.rs:48,70`・`tests/install-update-protocol.test.ts:121`・`tests/wasm-bridge.test.ts:61` でテストされている。

## 実装箇所

- `src-tauri/src/commands/update/network/helpers.rs:78` `pub(super) fn read_noupdate_patterns(dir: &Path) -> Vec<String> {`
- `src-tauri/src/commands/update/network/commands/check.rs:63` `let noupdate_patterns = read_noupdate_patterns(target_dir);`
- `src-tauri/src/commands/update/generation.rs:18` `let dev_opt_path = dir.join("developer_options.txt");`
- `crates/ui/src/update/parser/developer_options.rs:4` `pub fn parse_developer_options(content: &str) -> Vec<String> {`
- `crates/nanai-core/src/update_protocol/helpers.rs:83` `pub fn parse_developer_options_txt(content: &str) -> DeveloperOptionsManifest {`
- `ui/ts/core/actions/update-protocol.ts:108` `export function isNoUpdatePath(path: string, patterns: string[] = []): boolean {`
- `src-tauri/src/commands/install/archive/packaging.rs:10` `// [自動的に除外される対象]: UKADOC / SSP developer_options.txt 仕様自動除外定義`
- `tests/install-update-protocol.test.ts:121` `it("identifies noupdate paths from developer_options patterns", async () => {`
