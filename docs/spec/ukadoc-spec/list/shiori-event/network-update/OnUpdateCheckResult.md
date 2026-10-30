# OnUpdateCheckResult

- **規格**: [OnUpdateCheckResult.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateCheckResult/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateCheckResult/)
- **検索語**: OnUpdateCheckResult
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

更新チェックのみ実行時 (メニュー「ネットワーク更新チェックのみ」) の最後に OnUpdateCheckResultEx 送信し、それがスクリプトを返さなかった場合に限って送信する。Reference0 フォーマットは OnUpdateResult と同じ (種別)[\1](OK|NG)[\1](件数|理由) 形式。

## 実装箇所

- `ui/js/core/app-update.js:24` `*    (種別)[\1](OK|NG)[\1](件数|理由), チェックのみ実行時は OnUpdateCheckResult(Ex)`
- `ui/js/core/app-update.js:229` `* OnUpdateResultEx (または OnUpdateCheckResultEx) を送信し、`
- `ui/js/core/app-update.js:251` `const baseEvent = checkOnly ? "OnUpdateCheckResult" : "OnUpdateResult";`
