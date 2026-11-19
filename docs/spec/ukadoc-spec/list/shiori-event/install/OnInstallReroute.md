# OnInstallReroute

- **規格**: [OnInstallReroute.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/install/OnInstallReroute/) (ukadoc-spec/list/shiori-event/install/OnInstallReroute.md)
- **検索語**: OnInstallReroute
- **対応状況**: ✅ 実装済

## 突合結果

UKADOC 規格準拠の「OnInstallReroute」イベント引数構築 (`build_install_reroute_args` / `buildInstallRerouteArgs`) を Rust コアおよび TypeScript アクションとして完全実装。


## 実装箇所

- `crates/nanai-core/src/install_protocol/events.rs` (`build_install_reroute_args`)
- `ui/ts/core/actions/install-protocol.ts` (`buildInstallRerouteArgs`)
