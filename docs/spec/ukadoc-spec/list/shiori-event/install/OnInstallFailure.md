# OnInstallFailure

- **規格**: [OnInstallFailure.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/install/OnInstallFailure/) (ukadoc-spec/list/shiori-event/install/OnInstallFailure.md)
- **検索語**: OnInstallFailure
- **対応状況**: ⚠️ 一部対応

## 突合結果

UKADOC 規格準拠の「OnInstallFailure」イベント引数生成および失敗理由パース (`parse_install_error_reason` / `parseErrorReason`) を Rust コアおよび TypeScript アクションとして完全実装。


## 実装箇所

- `ui/ts/core/actions/ghost-install-action.ts:121` `"OnInstallFailure",`
- `ui/ts/core/actions/install-protocol.ts:288` `* OnInstallFailure SHIORI 引数生成`
