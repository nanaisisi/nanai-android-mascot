# OnNotifyPluginFailure

- **規格**: [OnNotifyPluginFailure.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/event-send-failure/OnNotifyPluginFailure/) (ukadoc-spec/list/shiori-event/event-send-failure/OnNotifyPluginFailure.md)
- **検索語**: OnNotifyPluginFailure
- **対応状況**: ✅ 実装済

## 突合結果

OnNotifyPluginFailure イベント送信失敗時のSHIORI通知イベントを実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify).

## 実装箇所

- `ui/ts/ghost/shiori-notify.ts:354` `| "OnNotifyPluginFailure"`
- `ui/ts/ghost/shiori-protocol.ts:165` `NOTIFY_PLUGIN_FAILURE: "OnNotifyPluginFailure",`
