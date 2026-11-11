# OnApplicationVersion

- **規格**: [OnApplicationVersion.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event-ex/app-common/OnApplicationVersion/) (ukadoc-spec/list/shiori-event-ex/app-common/OnApplicationVersion.md)
- **検索語**: notifyApplicationVersion
- **対応状況**: ⚠️ 一部対応

## 突合結果

外部アプリケーションバージョン通知時に `OnApplicationVersion` SHIORIイベント（Reference0: アプリ名/ID, Reference1: バージョン文字列）を送信する通知処理を実装 (`ui/js/ghost/shiori-notify.js` -> `notifyApplicationVersion`)。

## 実装箇所

- `ui/ts/ghost/shiori-notify/application-headline.ts:69` `async notifyApplicationVersion(this: any, appName: string, version = "") {`
