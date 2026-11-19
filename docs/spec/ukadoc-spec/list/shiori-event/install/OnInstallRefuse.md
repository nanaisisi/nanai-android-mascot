# OnInstallRefuse

- **規格**: [OnInstallRefuse.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/install/OnInstallRefuse/) (ukadoc-spec/list/shiori-event/install/OnInstallRefuse.md)
- **検索語**: OnInstallRefuse
- **対応状況**: ✅ 実装済

## 突合結果

UKADOC 規格準拠の「OnInstallRefuse」イベント引数構築 (`build_install_refuse_args` / `buildInstallRefuseArgs`) を Rust コアおよび TypeScript アクションとして完全実装。


## 実装箇所

- `crates/nanai-core/src/install_protocol/events.rs` (`build_install_refuse_args`)
- `ui/ts/core/actions/install-protocol.ts` (`buildInstallRefuseArgs`)
