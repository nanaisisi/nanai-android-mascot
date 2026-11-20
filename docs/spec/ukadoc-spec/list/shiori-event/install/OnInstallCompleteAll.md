# OnInstallCompleteAll

- **規格**: [OnInstallCompleteAll.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/install/OnInstallCompleteAll/) (ukadoc-spec/list/shiori-event/install/OnInstallCompleteAll.md)
- **検索語**: OnInstallCompleteAll
- **対応状況**: ⚠️ 一部対応

## 突合結果

UKADOC 規格準拠の「OnInstallCompleteAll」イベント引数構築 (`build_install_complete_all_args` / `buildInstallCompleteAllArgs`) を Rust コアおよび TypeScript アクションとして完全実装。


## 実装箇所

- `crates/nanai-core/src/install_protocol/events.rs:85` `/// OnInstallCompleteAll SHIORI 引数生成 (複数リソース一括展開完了時)`
- `ui/ts/core/actions/install-protocol.ts:139` `* OnInstallCompleteAll SHIORI 引数生成 (複数リソース一括展開完了時)`
- `ui/ts/core/actions/install-protocol.ts:314` `* 同時インストール時のSHIORI引数構築 (OnInstallCompleteAll 連携)`
