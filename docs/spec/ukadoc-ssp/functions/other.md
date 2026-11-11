# その他の機能

- **規格**: [functions/other.md](https://ukatech.shillest.net/ukadoc-ssp/functions/other/) (ukadoc-ssp/functions/other.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

タスクトレイ格納（Android 常駐通知・スナップ退避）

## 実装箇所

- `src-tauri/src/commands/config.rs:52` `(_, other) => {`
- `src-tauri/src/commands/config.rs:53` `base_map.insert(k, other);`
- `crates/nanai-core/src/update_protocol.rs:241` `assert!(!is_no_update_path("other.txt", &patterns));`
- `crates/nanai-vfs/src/resolver/vfs_trait.rs:33` `Err(io::Error::other(format!(`
- `crates/ui/src/script/ast/tests/ast_inspection.rs:290` `other => other.clone(),`
