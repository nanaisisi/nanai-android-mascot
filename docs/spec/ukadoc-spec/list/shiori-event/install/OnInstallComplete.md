# OnInstallComplete

- **規格**: [OnInstallComplete.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/install/OnInstallComplete/) (ukadoc-spec/list/shiori-event/install/OnInstallComplete.md)
- **検索語**: OnInstallComplete
- **対応状況**: ⚠️ 一部対応

## 突合結果

UKADOC 規格準拠の「OnInstallComplete」イベント引数構築 (`build_install_complete_args`) を Rust コアおよび TypeScript アクションとして完全実装。


## 実装箇所

- `crates/nanai-core/src/install_protocol/events.rs:31` `/// OnInstallComplete SHIORI 引数生成`
- `ui/ts/core/actions/ghost-install-action.ts:81` `"OnInstallComplete",`
- `ui/ts/core/actions/ghost-install-action.ts:103` `"OnInstallComplete",`
- `ui/ts/core/actions/ghost-install-action.ts:115` `"OnInstallComplete",`
- `ui/ts/core/actions/install-protocol.ts:100` `* OnInstallComplete SHIORI 引数生成`
