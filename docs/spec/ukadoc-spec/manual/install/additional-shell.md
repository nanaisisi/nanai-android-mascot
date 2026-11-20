# 標準的な追加シェル構成

- **規格**: [install.md](../../../../ukadoc-spec/manual/install.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/install/))
- **検索語**: assets/shell
- **対応状況**: ✅ 実装済

## 突合結果

`inspect_zip_archive` が `type,shell` を受理し、`install.txt` の `accept` 指定に基づいて既存の対象ゴーストを特定し、その `shell/<additional_shell>/` 配下へ展開する解決処理を実装済み。

## 実装箇所

- `src-tauri/src/commands/install/archive/inspection/analyzer/zip_inspector.rs:112` `&& kind != "shell"`
- `src-tauri/src/commands/install/archive/inspection/analyzer/zip_inspector.rs:133` `"shell" => "assets/shell",`
- `crates/nanai-core/src/install_protocol/helpers.rs:7` `pub fn normalize_install_type(install_type: Option<&str>) -> String {`
- `crates/ui/src/update/types/install.rs:131` `pub fn is_acceptable_by(&self, ghost_name: &str) -> bool {`
- `ui/ts/core/actions/install-protocol.ts:60` `export function normalizeInstallType(`
- `tests/install-protocol/install-arguments.test.ts:68` `buildInstallRerouteArgs("TargetGhost", "shell", "NewShell"),`
