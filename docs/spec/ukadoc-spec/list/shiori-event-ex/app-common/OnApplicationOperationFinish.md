# OnApplicationOperationFinish

- **規格**: [OnApplicationOperationFinish.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event-ex/app-common/OnApplicationOperationFinish/) (ukadoc-spec/list/shiori-event-ex/app-common/OnApplicationOperationFinish.md)
- **検索語**: notifyApplicationOperationFinish
- **対応状況**: ✅ 実装済

## 突合結果

外部アプリケーション操作完了時に `OnApplicationOperationFinish` SHIORIイベント（Reference0: アプリ名/ID, Reference1: 操作名）を送信する通知処理を実装 (`ui/js/ghost/shiori-notify.js` -> `notifyApplicationOperationFinish`)。

## 実装箇所

- `ui/js/ghost/shiori-notify.js:104` `async notifyApplicationOperationFinish(appName, operationName = "") {`
