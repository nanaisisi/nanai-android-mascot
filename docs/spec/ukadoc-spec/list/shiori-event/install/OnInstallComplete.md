# OnInstallComplete

- **規格**: [OnInstallComplete.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/install/OnInstallComplete/) (ukadoc-spec/list/shiori-event/install/OnInstallComplete.md)
- **検索語**: OnInstallComplete
- **対応状況**: ✅ 実装済

## 突合結果

UKADOC 規格準拠の「OnInstallComplete」イベント引数構築 (`build_install_complete_args`) を Rust コアおよび TypeScript アクションとして完全実装。


## 実装箇所

- `crates/nanai-core/src/install_protocol/events.rs` (`build_install_complete_args`)
- `ui/ts/core/actions/install-protocol.ts` (`buildInstallCompleteArgs`)
- `ui/ts/core/actions/ghost-install-action.ts` (`OnInstallComplete`)
