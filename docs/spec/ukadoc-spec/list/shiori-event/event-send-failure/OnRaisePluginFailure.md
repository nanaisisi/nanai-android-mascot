# OnRaisePluginFailure

- **規格**: [OnRaisePluginFailure.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/event-send-failure/OnRaisePluginFailure/) (ukadoc-spec/list/shiori-event/event-send-failure/OnRaisePluginFailure.md)
- **検索語**: OnRaisePluginFailure
- **対応状況**: ⚠️ 一部対応

## 突合結果

OnRaisePluginFailure イベント送信失敗時のSHIORI通知イベントを実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify).

## 実装箇所

- `ui/ts/ghost/shiori-protocol.ts:167` `RAISE_PLUGIN_FAILURE: "OnRaisePluginFailure",`
- `ui/ts/ghost/shiori-notify/input-events.ts:78` `| "OnRaisePluginFailure"`
