# fmo-mutex : FMO (File Mapping Object)

- **規格**: [fmo.md](https://ukatech.shillest.net/ukadoc-spec/spec/fmo-mutex/fmo/) (ukadoc-spec/spec/fmo-mutex/fmo.md)
- **対応状況**: ✅ 実装済

## 突合結果

FMO システム状態（`FmoSystemStatus`, `FmoGhostStatus`）および `get_fmo_status` Tauri コマンドによる JSON 出力実装を完備 (`src-tauri/src/fmo.rs`)。

## 実装箇所

- `crates/ui/src/lib.rs:4` `pub mod fmo;`
- `src-tauri/src/fmo.rs:6` `pub use nanai_android_mascot_ui::fmo::FmoEntry;`
- `ui/ts/core/app-actions.ts:16` `export * from "./actions/sstp-fmo-actions.js";`
- `ui/ts/ui/submenu-renderer.ts:201` `{ action: "update-fmo", label: "FMOの整理/更新 (E)", shortcut: "" },`
- `tests/sstp-fmo-integration.test.ts:6` `import "./sstp-fmo/sstp-actions.test.js";`
- `crates/ui/src/lib.rs:27` `pub use fmo::{`
