# 全般

- **規格**: [conn1.md](../../../../ukadoc-ssp/config/conn1.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/conn1/))
- **検索語**: conn1, protocol, ssl
- **対応状況**: ✅ 実装済

## 突合結果

使用するネットワークプロトコル（IPv4/IPv6）および SSL/TLS サーバ証明書検証の設定は未実装。


## 実装箇所

- `crates/ui/src/shiori/mod.rs:13` `pub mod protocol;`
- `src-tauri/shiori-host/src/host.rs:2` `use super::protocol::run_command_loop;`
- `ui/ts/core/app-update.ts:5` `} from "./actions/update-protocol.js";`
- `tests/install-protocol.test.ts:6` `import "./install-protocol/install-constants.test.js";`
- `crates/ui/src/shiori/mod.rs:21` `pub use protocol::{ShioriRequest, ShioriResponse};`
- `src-tauri/shiori-host/src/main.rs:10` `mod protocol;`
