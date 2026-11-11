# OnUpdateCheckFailure

- **規格**: [OnUpdateCheckFailure.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateCheckFailure/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateCheckFailure/)
- **検索語**: OnUpdateCheckFailure
- **対応状況**: ✅ 実装済

## 突合結果

更新チェックのみ実行時に check_ghost_update が失敗した場合に送信する。Reference0 = 失敗理由 (404 / timeout / fileio)、Reference4 = "manual"。

## 実装箇所

- `ui/ts/core/app-update.ts:188` `"OnUpdateCheckFailure",`
- `ui/ts/core/actions/update-protocol.ts:10` `* - OnUpdateCheckComplete / OnUpdateCheckFailure / OnUpdateCheckResult / OnUpdat`
- `tests/core-coverage-boost/app-update-coverage.test.ts:97` `const failureEvt = sentEvents.find((e) => e.evt === "OnUpdateCheckFailure");`
