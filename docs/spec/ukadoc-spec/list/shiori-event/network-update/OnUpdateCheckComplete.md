# OnUpdateCheckComplete

- **規格**: [OnUpdateCheckComplete.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateCheckComplete/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateCheckComplete/)
- **検索語**: OnUpdateCheckComplete
- **対応状況**: ✅ 実装済

## 突合結果

更新チェックのみ実行時 (メニュー「ネットワーク更新チェックのみ」/ checkOnly オプション) に check_ghost_update の成功結果を元に送信する。更新あり: Reference0 = 更新ファイル総数、更新なし: "none"。Reference1 = ファイル名リスト (カンマ区切り)、Reference3 = "ghost"、Reference4 = "manual"。

## 実装箇所

- `ui/ts/core/app-update.ts:71` `"OnUpdateCheckComplete",`
- `ui/ts/core/actions/update-protocol.ts:10` `* - OnUpdateCheckComplete / OnUpdateCheckFailure / OnUpdateCheckResult / OnUpdat`
- `tests/core-coverage-boost/app-update-coverage.test.ts:55` `const checkComp = sentEvents.find((e) => e.evt === "OnUpdateCheckComplete");`
