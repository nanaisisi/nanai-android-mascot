# `surfacetable.txt`

- **規格**: [shell.md](../../../../ukadoc-spec/manual/shell.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/shell/))
- **検索語**: surfacetable.txt
- **対応状況**: ⚠️ 一部対応

## 突合結果

`parse_surface_table` と `Shell::load` により `surfacetable.txt`（`charset`・`version`・`scope`・`option`・`group`・`__parts` 除外・`__disabled` グループ・名前解決）をパースし、`ShellManifest::surface_table` へ格納するバックエンド処理と単体テストを実装済み。フロントエンド側も `ui/ts/surface/shell-manifest.ts` に `RawSurfaceTable` 型および `getVisibleSurfaceTableGroups` / `getSurfaceDisplayName` ヘルパーを実装し、サーフィステストモーダル（`surface-test-modal-content` / `open-surface-test`）へ接続済み。

## 実装箇所

- `crates/ui/src/surfacetable/parser.rs:9` `pub fn parse_surface_table(text: &str) -> SurfaceTable {`
- `crates/ui/src/shell/core.rs:70` `let surface_table = resolve_vfs_path(directory, "surfacetable.txt")`
- `crates/ui/src/shell/core.rs:115` `pub fn surface_display_name(&self, number: u32) -> Option<&str> {`
- `crates/ui/src/manifest/shell_manifest.rs:29` `pub(crate) surface_table: Option<SurfaceTable>,`
- `crates/ui/src/shell/tests.rs:39` `let table = shell.surface_table.as_ref().unwrap();`
- `crates/ui/src/surfacetable/tests.rs:98` `fn test_parse_mock_nanai_file() {`
- `ui/ts/surface/shell-manifest.ts` `RawSurfaceTable`, `getVisibleSurfaceTableGroups`, `getSurfaceDisplayName`
- `ui/ts/ui/templates/system-templates.ts` `surface-test-modal-content`
- `ui/ts/ui/modal-settings-handlers.ts` `setupSurfaceTestListeners`
- `ui/ts/core/actions/menu-action-dispatcher.ts` `open-surface-test`
- `tests/surfacetable-helper.test.ts` `surfacetable helpers` 単体テスト
