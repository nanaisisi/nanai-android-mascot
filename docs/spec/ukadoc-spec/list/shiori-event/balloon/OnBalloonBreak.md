# OnBalloonBreak

- **規格**: [OnBalloonBreak.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/balloon/OnBalloonBreak/) (ukadoc-spec/list/shiori-event/balloon/OnBalloonBreak.md)
- **検索語**: OnBalloonBreak
- **対応状況**: ✅ 実装済

## 突合結果

`OnBalloonBreak` (バルーン中断) SHIORIイベント送信処理を実装 (`ui/js/ghost/shiori-notify.js` -> `sendShioriNotify`).

## 実装箇所

- `ui/ts/ghost/shiori-notify.ts:354` `* バルーン中断通知 (OnBalloonBreak) を送信 (UKADOC準拠)`
- `ui/ts/ghost/shiori-notify.ts:365` `return await this.sendShioriNotify("OnBalloonBreak", [`
