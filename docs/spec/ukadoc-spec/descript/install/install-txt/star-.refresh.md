# *.refresh,数値

- **規格**: [star-.refresh.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/star-.refresh.md)
- **検索語**: *.refresh
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `*.refresh`（`ghost.refresh`, `shell.refresh` 等）をパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive/mod.rs:36` `if inspection.refresh {`
- `src-tauri/src/commands/install/archive/mod.rs:39` `target_dir, inspection.refresh_undelete_mask`
- `src-tauri/src/commands/install/archive/mod.rs:41` `perform_refresh_cleanup(&target_dir, &inspection.refresh_undelete_mask);`
- `src-tauri/src/commands/install/archive/mod.rs:46` `if res_target.refresh && res_target.destination_dir.exists() {`
- `src-tauri/src/commands/install/archive/mod.rs:49` `res_target.destination_dir, res_target.refresh_undelete_mask`
