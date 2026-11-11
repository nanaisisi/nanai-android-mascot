# OnApplicationBoot

- **規格**: [OnApplicationBoot.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event-ex/app-common/OnApplicationBoot/) (ukadoc-spec/list/shiori-event-ex/app-common/OnApplicationBoot.md)
- **検索語**: notifyApplicationBoot
- **対応状況**: ⚠️ 一部対応

## 突合結果

外部アプリケーション起動時に `OnApplicationBoot` SHIORIイベント（Reference0: アプリ名/ID, Reference1: パス）を送信する通知処理を実装 (`ui/js/ghost/shiori-notify.js` -> `notifyApplicationBoot`)。

## 実装箇所

- `ui/ts/ghost/shiori-notify/application-headline.ts:21` `async notifyApplicationBoot(this: any, appName: string, appPath = "") {`
