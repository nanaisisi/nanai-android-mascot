# OnInstallCompleteEx

- **規格**: [OnInstallCompleteEx.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/install/OnInstallCompleteEx/) (ukadoc-spec/list/shiori-event/install/OnInstallCompleteEx.md)
- **検索語**: OnInstallCompleteEx
- **対応状況**: ✅ 実装済

## 突合結果

UKADOC 規格準拠の「OnInstallCompleteEx」イベント引数構築 (`build_install_complete_ex_args` / `buildInstallCompleteExArgs`) を Rust コアおよび TypeScript アクションとして完全実装。


## 実装箇所

- `crates/nanai-core/src/install_protocol/events.rs` (`build_install_complete_ex_args`)
- `ui/ts/core/actions/install-protocol.ts` (`buildInstallCompleteExArgs`)
- `ui/ts/core/actions/ghost-install-action.ts` (`OnInstallCompleteEx`)
