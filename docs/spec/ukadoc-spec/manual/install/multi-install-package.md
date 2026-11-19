# SSP専用 複数インストール用パッケージ

- **規格**: [install.md](../../../../ukadoc-spec/manual/install.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/install/))
- **検索語**: buildInstallCompleteAllArgs
- **対応状況**: ⚠️ 一部対応

## 突合結果

`inspect_zip_archive` が `type,package` を受理し、`crates/nanai-core/src/install_protocol/helpers.rs`・`crates/ui/src/update/types/install.rs`・`ui/ts/core/actions/install-protocol.ts` に複数インストール判定および `OnInstallCompleteAll` 引数生成を実装済み。ただし実展開処理は最浅階層の単一 `install.txt` のみを解析しており、パッケージ内各サブディレクトリにある個別 `install.txt` を再帰的に処理する多段展開は未実装。

## 実装箇所

- `src-tauri/src/commands/install/archive/inspection/analyzer/zip_inspector.rs:22` `if lower == "install.txt" || lower.ends_with("/install.txt") {`
- `src-tauri/src/commands/install/archive/inspection/analyzer/zip_inspector.rs:116` `&& kind != "package"`
- `crates/ui/src/update/types/install.rs:153` `pub fn is_multi_install(&self) -> bool {`
- `crates/nanai-core/src/install_protocol/helpers.rs:64` `pub fn build_install_multi_args(installed_list: &[(String, String)]) -> MultiResourceInstallResult {`
- `ui/ts/core/actions/install-protocol.ts:144` `export function buildInstallCompleteAllArgs(`
- `tests/install-protocol/install-arguments.test.ts:48` `test("buildInstallCompleteAllArgs formats multiple installed resources", () => {`
