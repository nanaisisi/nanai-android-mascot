# *.refresh,数値

- **規格**: [star-.refresh.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/star-.refresh.md)
- **検索語**: *.refresh
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `*.refresh`（`ghost.refresh`, `shell.refresh` 等）をパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive/inspection.rs:45` `// 1. 無印 (例: balloon.directory, balloon.refresh, balloon.refreshundeletemask)`
- `src-tauri/src/commands/install/archive/inspection.rs:265` `refresh: res_config.refresh,`
- `src-tauri/src/commands/install/archive/inspection.rs:266` `refresh_undelete_mask: res_config.refresh_undelete_mask,`
- `src-tauri/src/commands/install/archive/inspection.rs:298` `map.insert("balloon.refresh".to_string(), "1".to_string());`
- `src-tauri/src/commands/install/archive/inspection.rs:300` `"balloon.refreshundeletemask".to_string(),`
