# OnNotifyOtherFailure

- **規格**: [OnNotifyOtherFailure.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/event-send-failure/OnNotifyOtherFailure/) (ukadoc-spec/list/shiori-event/event-send-failure/OnNotifyOtherFailure.md)
- **検索語**: OnNotifyOtherFailure
- **対応状況**: ✅ 実装済

## 突合結果

OnNotifyOtherFailure イベント送信失敗時のSHIORI通知イベントを実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify).

## 実装箇所

- `ui/ts/ghost/shiori-notify.ts:353` `| "OnNotifyOtherFailure"`
- `ui/ts/ghost/shiori-protocol.ts:164` `NOTIFY_OTHER_FAILURE: "OnNotifyOtherFailure",`
