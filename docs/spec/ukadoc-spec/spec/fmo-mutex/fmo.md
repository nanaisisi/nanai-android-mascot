# fmo-mutex : FMO (File Mapping Object)

- **規格**: [fmo.md](https://ukatech.shillest.net/ukadoc-spec/spec/fmo-mutex/fmo/) (ukadoc-spec/spec/fmo-mutex/fmo.md)
- **対応状況**: ✅ 実装済

## 突合結果

FMO システム状態（`FmoSystemStatus`, `FmoGhostStatus`）および `get_fmo_status` Tauri コマンドによる JSON 出力実装を完備 (`src-tauri/src/fmo.rs`)。

## 実装箇所

- `src-tauri/src/fmo.rs:27` `pub async fn get_fmo_status(state: tauri::State<'_, AppState>) -> Result<String,`
- `src-tauri/src/fmo.rs:47` `let fmo = FmoSystemStatus {`
- `src-tauri/src/fmo.rs:53` `serde_json::to_string(&fmo).map_err(|e| e.to_string())`
- `src-tauri/src/lib.rs:20` `mod fmo;`
- `src-tauri/src/lib.rs:159` `fmo::get_fmo_status,`
