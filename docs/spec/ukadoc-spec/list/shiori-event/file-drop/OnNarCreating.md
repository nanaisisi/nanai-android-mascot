# OnNarCreating

- **規格**: [OnNarCreating.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/file-drop/OnNarCreating/) (ukadoc-spec/list/shiori-event/file-drop/OnNarCreating.md)
- **検索語**: OnNarCreating
- **対応状況**: ⚠️ 一部対応

## 突合結果

OnNarCreating ファイルドロップ/外部連携SHIORIイベント通知処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify).

## 実装箇所

- `ui/ts/ghost/shiori-protocol.ts:108` `NAR_CREATING: "OnNarCreating",`
- `ui/ts/ghost/shiori-notify/input-events.ts:40` `| "OnNarCreating"`
