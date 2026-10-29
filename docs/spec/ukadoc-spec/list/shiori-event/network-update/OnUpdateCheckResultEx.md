# OnUpdateCheckResultEx

- **規格**: [OnUpdateCheckResultEx.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateCheckResultEx/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateCheckResultEx/)
- **検索語**: OnUpdateCheckResultEx
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

更新チェックのみ実行時 (メニュー「ネットワーク更新チェックのみ」) の最後に最初に送信される一括結果通知。Reference0 フォーマットは OnUpdateResultEx と同じ (対象の名前)[\1](種別 ghost)[\1](OK|NG)[\1](件数|理由) 形式。

## 実装箇所

- `ui/js/core/app-update.js:284` `* OnUpdateResultEx (または OnUpdateCheckResultEx) を送信し、`
