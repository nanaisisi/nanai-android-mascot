# *.refresh,数値

- **規格**: [star-.refresh.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/star-.refresh.md)
- **検索語**: *.refresh
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs` および `postprocess.rs` において `*.refresh`（`balloon.refresh`, `ghost0.refresh` 等）の解析およびリフレッシュクリーンアップ処理が完全実装済み。

## 実装箇所

- `crates/ui/src/update/engine.rs:21` `if !manifest.refresh {`
- `src-tauri/src/commands/install/archive/mod.rs:56` `if inspection.refresh() {`
- `crates/ui/src/update/tests/installer_manifest.rs:32` `balloon.refresh,1\r\n\`
- `src-tauri/src/commands/install/archive/mod.rs:60` `inspection.refresh_undelete_mask()`
- `crates/ui/src/update/tests/installer_manifest.rs:33` `balloon.refreshundeletemask,balloon_pref.txt\r\n\`
- `src-tauri/src/commands/install/archive/mod.rs:62` `perform_refresh_cleanup(&target_dir, inspection.refresh_undelete_mask());`
