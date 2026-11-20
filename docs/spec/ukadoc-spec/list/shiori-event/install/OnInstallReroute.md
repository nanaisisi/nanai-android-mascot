# OnInstallReroute

- **規格**: [OnInstallReroute.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/install/OnInstallReroute/) (ukadoc-spec/list/shiori-event/install/OnInstallReroute.md)
- **検索語**: OnInstallReroute
- **対応状況**: ⚠️ 一部対応

## 突合結果

UKADOC 規格準拠の「OnInstallReroute」イベント引数構築 (`build_install_reroute_args` / `buildInstallRerouteArgs`) を Rust コアおよび TypeScript アクションとして完全実装。


## 実装箇所

- `crates/nanai-core/src/install_protocol/events.rs:128` `/// OnInstallReroute SHIORI 引数生成 (別ゴーストへの転送指定時)`
- `ui/ts/core/actions/install-protocol.ts:177` `* OnInstallReroute SHIORI 引数生成 (別ゴーストへの転送指定時)`
