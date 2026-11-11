# fmo-mutex : FMO (File Mapping Object)

- **規格**: [fmo.md](https://ukatech.shillest.net/ukadoc-spec/spec/fmo-mutex/fmo/) (ukadoc-spec/spec/fmo-mutex/fmo.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

FMO システム状態（`FmoSystemStatus`, `FmoGhostStatus`）および `get_fmo_status` Tauri コマンドによる JSON 出力実装を完備 (`src-tauri/src/fmo.rs`)。

## 実装箇所

- `src-tauri/src/fmo.rs:6` `pub use nanai_android_mascot_ui::fmo::FmoEntry;`
- `src-tauri/src/fmo.rs:77` `let fmo = FmoSystemStatus {`
- `src-tauri/src/fmo.rs:83` `serde_json::to_string(&fmo).map_err(|e| e.to_string())`
- `src-tauri/src/fmo.rs:124` `let fmo = FmoSystemStatus {`
- `src-tauri/src/fmo.rs:130` `serde_json::to_string(&fmo).map_err(|e| e.to_string())`
