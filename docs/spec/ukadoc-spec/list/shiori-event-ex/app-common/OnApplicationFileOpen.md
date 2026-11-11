# OnApplicationFileOpen

- **規格**: [OnApplicationFileOpen.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event-ex/app-common/OnApplicationFileOpen/) (ukadoc-spec/list/shiori-event-ex/app-common/OnApplicationFileOpen.md)
- **検索語**: notifyApplicationFileOpen
- **対応状況**: ⚠️ 一部対応

## 突合結果

外部アプリケーションファイルオープン時に `OnApplicationFileOpen` SHIORIイベント（Reference0: アプリ名/ID, Reference1: ファイルパス）を送信する通知処理を実装 (`ui/js/ghost/shiori-notify.js` -> `notifyApplicationFileOpen`)。

## 実装箇所

- `ui/ts/ghost/shiori-notify/application-headline.ts:45` `async notifyApplicationFileOpen(this: any, appName: string, filePath = "") {`
