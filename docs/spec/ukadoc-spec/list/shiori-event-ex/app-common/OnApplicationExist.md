# OnApplicationExist

- **規格**: [OnApplicationExist.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event-ex/app-common/OnApplicationExist/) (ukadoc-spec/list/shiori-event-ex/app-common/OnApplicationExist.md)
- **検索語**: checkApplicationExist
- **対応状況**: ⚠️ 一部対応

## 突合結果

外部アプリケーションの起動・存在チェック用 `OnApplicationExist` SHIORIイベント送信関数を実装 (`ui/js/ghost/shiori-notify.js` -> `checkApplicationExist`).

- Reference0: 対象アプリケーションID/名前
- 戻り値: 起動状態 (boolean / "1" or "0")

## 実装箇所

- `ui/ts/ghost/shiori-notify/application-headline.ts:35` `async checkApplicationExist(this: any, appName: string): Promise<boolean> {`
