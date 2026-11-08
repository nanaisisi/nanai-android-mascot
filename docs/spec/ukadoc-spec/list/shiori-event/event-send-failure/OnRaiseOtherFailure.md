# OnRaiseOtherFailure

- **規格**: [OnRaiseOtherFailure.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/event-send-failure/OnRaiseOtherFailure/) (ukadoc-spec/list/shiori-event/event-send-failure/OnRaiseOtherFailure.md)
- **検索語**: OnRaiseOtherFailure
- **対応状況**: ✅ 実装済

## 突合結果

OnRaiseOtherFailure イベント送信失敗時のSHIORI通知イベントを実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify).

## 実装箇所

- `ui/ts/ghost/shiori-notify.ts:355` `| "OnRaiseOtherFailure"`
- `ui/ts/ghost/shiori-protocol.ts:166` `RAISE_OTHER_FAILURE: "OnRaiseOtherFailure",`
