# refresh,数値

- **規格**: [refresh.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/refresh.md)
- **検索語**: refresh
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `refresh` キーをパース・参照する実装が行われている。

## 実装箇所

- `crates/ui/src/update/engine.rs:21` `if !manifest.refresh {`
- `src-tauri/src/commands/install/archive/mod.rs:36` `if inspection.refresh {`
- `ui/ts/ui/modal-explorer.ts:101` `?.querySelector("#explorer-refresh-btn")`
- `tests/modal-explorer.test.ts:114` `const refreshBtn = getEl("explorer-refresh-btn");`
- `crates/ui/src/update/types.rs:233` `pub refresh: bool,`
- `src-tauri/src/commands/install/archive/mod.rs:38` `"🧹 Performing refresh cleanup on target_dir: {:?} (masks: {:?})",`
