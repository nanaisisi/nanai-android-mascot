# OnInstallBegin

- **規格**: [OnInstallBegin.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/install/OnInstallBegin/) (ukadoc-spec/list/shiori-event/install/OnInstallBegin.md)
- **検索語**: OnInstallBegin
- **対応状況**: ✅ 実装済

## 突合結果

UKADOC 規格準拠の「OnInstallBegin」イベント引数構築 (`build_install_begin_args`) を Rust コアおよび TypeScript アクションとして完全実装。


## 実装箇所

- `crates/nanai-core/src/install_protocol/events.rs` (`build_install_begin_args`)
- `ui/ts/core/actions/install-protocol.ts` (`buildInstallBeginArgs`)
