# fmo-mutex : FMO (File Mapping Object)

- **規格**: [fmo.md](https://ukatech.shillest.net/ukadoc-spec/spec/fmo-mutex/fmo/) (ukadoc-spec/spec/fmo-mutex/fmo.md)
- **対応状況**: ❌ 未実装

## 突合結果

FMO の作成・参照なし (Mutex の検索ヒットは Rust 標準の排他制御であり無関係)。


## 実装箇所

- `src-tauri/src/fmo.rs:27` `pub async fn get_fmo_status(`
- `src-tauri/src/fmo.rs:49` `let fmo = FmoSystemStatus {`
- `src-tauri/src/fmo.rs:55` `serde_json::to_string(&fmo).map_err(|e| e.to_string())`
- `src-tauri/src/lib.rs:20` `mod fmo;`
- `src-tauri/src/lib.rs:158` `shiori::fmo::get_fmo_status,`
