# OnBalloonClose

- **規格**: [OnBalloonClose.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/balloon/OnBalloonClose/) (ukadoc-spec/list/shiori-event/balloon/OnBalloonClose.md)
- **検索語**: OnBalloonClose
- **対応状況**: ✅ 実装済

## 突合結果

`OnBalloonClose` (バルーン閉じる) SHIORIイベント送信処理を実装 (`ui/js/ghost/shiori-notify.js` -> `sendShioriNotify`).

## 実装箇所

- `ui/ts/ghost/shiori-notify.ts:346` `* バルーン閉じる通知 (OnBalloonClose) を送信 (UKADOC準拠)`
- `ui/ts/ghost/shiori-notify.ts:350` `return await this.sendShioriNotify("OnBalloonClose", [lastScript]);`
