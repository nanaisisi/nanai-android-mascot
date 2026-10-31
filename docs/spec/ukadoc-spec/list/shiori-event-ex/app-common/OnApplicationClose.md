# OnApplicationClose

- **規格**: [OnApplicationClose.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event-ex/app-common/OnApplicationClose/) (ukadoc-spec/list/shiori-event-ex/app-common/OnApplicationClose.md)
- **検索語**: notifyApplicationClose
- **対応状況**: ✅ 実装済

## 突合結果

外部アプリケーション終了時に `OnApplicationClose` SHIORIイベント（Reference0: アプリ名/ID）を送信する通知処理を実装 (`ui/js/ghost/shiori-notify.js` -> `notifyApplicationClose`)。

## 実装箇所

- `ui/js/ghost/shiori-notify.js:70` `async notifyApplicationClose(appName) {`
