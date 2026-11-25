# ネットワーク接続問い合わせ

- **規格**: [conn1.md](../../../../ukadoc-ssp/config/conn1.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/conn1/))
- **検索語**: dialup, network
- **対応状況**: ✅ 実装済

## 突合結果

ダイアルアップ接続監視および時間帯による自動接続禁止設定は未実装。


## 実装箇所

- `crates/nanai-core/src/shiori_protocol_helpers/events/mod.rs:4` `pub mod network;`
- `src-tauri/src/invoke.rs:97` `commands::update::network::commands::check_ghost_update,`
- `ui/ts/core/app-actions.ts:14` `import { networkActions } from "./actions/network-actions.js";`
- `tests/app-update.test.ts:1` `import "./app-update/network-update-flows.test.js";`
- `crates/nanai-core/src/shiori_protocol_helpers/events/mod.rs:10` `pub use network::*;`
- `src-tauri/src/invoke.rs:98` `commands::update::network::commands::execute_ghost_update,`
