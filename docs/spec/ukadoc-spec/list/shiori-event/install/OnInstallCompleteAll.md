# OnInstallCompleteAll

- **規格**: [OnInstallCompleteAll.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/install/OnInstallCompleteAll/) (ukadoc-spec/list/shiori-event/install/OnInstallCompleteAll.md)
- **検索語**: OnInstallCompleteAll
- **対応状況**: ✅ 実装済

## 突合結果

UKADOC 規格準拠の「OnInstallCompleteAll」イベント引数構築 (`build_install_complete_all_args` / `buildInstallCompleteAllArgs`) を Rust コアおよび TypeScript アクションとして完全実装。


## 実装箇所

- `crates/nanai-core/src/install_protocol/events.rs` (`build_install_complete_all_args`)
- `ui/ts/core/actions/install-protocol.ts` (`buildInstallCompleteAllArgs`, `buildInstallMultiArgs`)
