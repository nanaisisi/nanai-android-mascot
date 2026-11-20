# ゴーストへのバルーン等同梱構成

- **規格**: [install.md](../../../../ukadoc-spec/manual/install.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/install/))
- **検索語**: resolve_bundled_resources_config
- **対応状況**: ✅ 実装済

## 突合結果

`resolve_bundled_resources_config` と `extract_zip_entries` により、`balloon` / `headline` / `plugin` / `shell` / `calendar.skin` / `calendar.plugin` の無印および連番 `0, 1, 2...` 指定（`*.directory` / `*.source.directory` / `*.refresh` / `*.refreshundeletemask`）を解析し、同梱側 `install.txt` を無視して各アセット格納先へ直接展開する。`normalize_install_kind` により `ghost with balloon` 等の種別文字列にも対応し、`kind == "ghost"` 時の同梱 `shell` は対象ゴーストの `shell/` 配下へ展開する。

## 実装箇所

- `src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs:6` `pub fn resolve_bundled_resources_config(`
- `src-tauri/src/commands/install/archive/inspection/analyzer/zip_inspector.rs:140` `if kind == "ghost" || kind == "package" || kind == "shell" {`
- `src-tauri/src/commands/install/archive/extraction.rs:61` `for res_target in bundled_resources {`
- `src-tauri/src/commands/install/archive/mod.rs:47` `for res_target in inspection.bundled_resources() {`
- `crates/ui/src/update/parser/install_manifest.rs:70` `for &r_type in &supported_types {`
- `src-tauri/src/commands/install/archive/inspection/tests.rs:5` `fn test_resolve_bundled_resources_config_sequential() {`
