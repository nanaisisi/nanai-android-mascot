# fmo-mutex : Mutex

- **規格**: [mutex.md](https://ukatech.shillest.net/ukadoc-spec/spec/fmo-mutex/mutex/) (ukadoc-spec/spec/fmo-mutex/mutex.md)
- **対応状況**: ✅ 実装済

## 突合結果

ベースウェア識別用の名前付き Mutex なし。

## 実装箇所

- `src-tauri/src/lib.rs:161` `shiori::fmo::check_base_ware_mutex,`
- `src-tauri/src/shiori/fmo.rs:1` `//! FMO (File Mapping Object) & Mutex implementation (UKADOC / SSP fmo-mutex spe`
- `src-tauri/src/shiori/fmo.rs:82` `pub async fn check_base_ware_mutex() -> Result<HashMap<String, bool>, String> {`
