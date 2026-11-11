# OnUpdateResult

- **規格**: [OnUpdateResult.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateResult/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateResult/)
- **検索語**: OnUpdateResult
- **対応状況**: ⚠️ 一部対応

## 突合結果

ネットワーク更新 (またはチェックのみ) 実行完了後に OnUpdateResultEx 送信し、それがスクリプトを返さなかった場合に限って送信する (UKADOC準拠)。Reference0 に (種別 ghost)[\1](OK|NG)[\1](成功時: 更新ファイル数、更新なしなら 0 / 失敗時: 失敗理由)[\1](失敗原因ファイル名、特定できる場合のみ) 形式の文字列を格納。

## 実装箇所

- `ui/ts/core/app-update.ts:230` `const baseEvent = checkOnly ? "OnUpdateCheckResult" : "OnUpdateResult";`
- `ui/ts/core/actions/update-protocol.ts:11` `* - OnUpdateProcessExec / OnUpdateResult / OnUpdateResultEx / OnUpdateResultExpl`
