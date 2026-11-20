# OnInstallRefuse

- **規格**: [OnInstallRefuse.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/install/OnInstallRefuse/) (ukadoc-spec/list/shiori-event/install/OnInstallRefuse.md)
- **検索語**: OnInstallRefuse
- **対応状況**: ⚠️ 一部対応

## 突合結果

UKADOC 規格準拠の「OnInstallRefuse」イベント引数構築 (`build_install_refuse_args` / `buildInstallRefuseArgs`) を Rust コアおよび TypeScript アクションとして完全実装。


## 実装箇所

- `crates/nanai-core/src/install_protocol/events.rs:98` `/// OnInstallRefuse SHIORI 引数生成 (accept不一致や拒否条件合致時)`
- `ui/ts/core/actions/install-protocol.ts:159` `* OnInstallRefuse SHIORI 引数生成 (accept不一致や拒否条件合致時)`
- `crates/ui/src/update/types/install.rs:141` `/// インストール拒否理由を評価 (UKADOC OnInstallRefuse 準拠)`
