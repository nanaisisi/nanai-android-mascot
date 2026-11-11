# OnNarCreated

- **規格**: [OnNarCreated.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/file-drop/OnNarCreated/) (ukadoc-spec/list/shiori-event/file-drop/OnNarCreated.md)
- **検索語**: OnNarCreated
- **対応状況**: ⚠️ 一部対応

## 突合結果

OnNarCreated ファイルドロップ/外部連携SHIORIイベント通知処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify).

## 実装箇所

- `ui/ts/ghost/shiori-protocol.ts:109` `NAR_CREATED: "OnNarCreated",`
- `ui/ts/ghost/shiori-notify/input-events.ts:41` `| "OnNarCreated"`
