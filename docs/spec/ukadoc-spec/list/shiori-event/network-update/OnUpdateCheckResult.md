# OnUpdateCheckResult

- **規格**: [OnUpdateCheckResult.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateCheckResult/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateCheckResult/)
- **検索語**: OnUpdateCheckResult
- **対応状況**: ⚠️ 一部対応

## 突合結果

更新チェックのみ実行時 (メニュー「ネットワーク更新チェックのみ」) の最後に OnUpdateCheckResultEx 送信し、それがスクリプトを返さなかった場合に限って送信する。Reference0 フォーマットは OnUpdateResult と同じ (種別)[\1](OK|NG)[\1](件数|理由) 形式。

## 実装箇所

- `ui/ts/core/app-update.ts:230` `const baseEvent = checkOnly ? "OnUpdateCheckResult" : "OnUpdateResult";`
- `ui/ts/core/actions/update-protocol.ts:10` `* - OnUpdateCheckComplete / OnUpdateCheckFailure / OnUpdateCheckResult / OnUpdat`
