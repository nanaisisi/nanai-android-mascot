# `developer_options.txt`

- **規格**: [install.md](../../../../ukadoc-spec/manual/install.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/install/))
- **検索語**: developer_options.txt
- **対応状況**: ✅ 実装済

## 突合結果

ネットワーク更新定義生成（`generate_updates2_dau`）・ディレクトリスキャン（`parse_developer_options`）・WASM / TS 判定（`parse_developer_options_txt` / `isNoUpdatePath`）での `noupdate` 除外に加え、NAR アーカイブ作成処理（`create_nar_from_directory`）でも `developer_options.txt` を読み込んで `nonar` 指定のファイルを動的に除外する処理を実装済み。

## 実装箇所

- `src-tauri/src/commands/install/archive/packaging.rs:11` `const IGNORE_FILE_NAMES: &[&str] = &[`
- `src-tauri/src/commands/update/generation.rs:18` `let dev_opt_path = dir.join("developer_options.txt");`
- `src-tauri/src/ghost/scan/directory/filter.rs:13` `pub fn parse_developer_options(path: &Path) {`
- `crates/nanai-core/src/update_protocol/helpers.rs:83` `pub fn parse_developer_options_txt(content: &str) -> DeveloperOptionsManifest {`
- `crates/ui/src/update/parser/developer_options.rs:4` `pub fn parse_developer_options(content: &str) -> Vec<String> {`
- `ui/ts/core/actions/update-protocol.ts:108` `export function isNoUpdatePath(path: string, patterns: string[] = []): boolean {`
- `tests/install-update-protocol.test.ts:121` `it("identifies noupdate paths from developer_options patterns", async () => {`
