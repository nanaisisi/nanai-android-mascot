# `supplement` サプリメント構成

- **規格**: [install.md](../../../../ukadoc-spec/manual/install.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/install/))
- **検索語**: supplement
- **対応状況**: ⚠️ 一部対応

## 突合結果

`inspect_zip_archive` が `type,supplement` を受理し、アーカイブ内のディレクトリ構造を保ったまま `assets/ghost/<dir>/` 配下へ展開する。`InstallManifest::is_acceptable_by` / `evaluate_refusal` や `buildInstallRefuseArgs` による `accept` 判定・拒否引数生成は存在するものの、展開パイプライン側で `accept` を用いて既存の対象ゴーストを自動特定・マージする処理および不一致時の拒否（`OnInstallRefuse`）は未接続。

## 実装箇所

- `src-tauri/src/commands/install/archive/inspection/analyzer/zip_inspector.rs:115` `&& kind != "supplement"`
- `src-tauri/src/commands/install/archive/inspection/analyzer/zip_inspector.rs:131` `let target_base_str = match kind.as_str() {`
- `crates/ui/src/update/types/install.rs:131` `pub fn is_acceptable_by(&self, ghost_name: &str) -> bool {`
- `crates/ui/src/update/types/install.rs:142` `pub fn evaluate_refusal(&self, current_ghost_name: &str) -> Option<&'static str> {`
- `ui/ts/core/actions/install-protocol.ts:165` `export function buildInstallRefuseArgs(`
- `tests/install-protocol/install-arguments.test.ts:59` `assert.deepEqual(buildInstallRefuseArgs("accept failed", "OtherGhost"), [`
