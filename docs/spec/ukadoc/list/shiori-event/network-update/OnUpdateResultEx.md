# OnUpdateResultEx

- **規格**: [OnUpdateResultEx.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateResultEx/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateResultEx/)
- **検索語**: OnUpdateResultEx
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

ネットワーク更新 (またはチェックのみ) 実行完了後に最初に送信される一括結果通知。Reference0 に (対象の名前)[\1](種別 ghost)[\1](OK|NG)[\1](成功時: 更新ファイル数、更新なしなら 0 / 失敗時: 失敗理由)[\1](失敗原因ファイル名、特定できる場合のみ) 形式の文字列を格納。

## 実装箇所

- `ui/js/core/app-update.js` `await gc.sendShioriEvent(`${baseEvent}Ex`, [[ghostName, ...parts].join(sep)])` (baseEvent = "OnUpdateResult", `sep` = バイト値1)
