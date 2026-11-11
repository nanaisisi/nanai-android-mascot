# OnFileDropped

- **規格**: [OnFileDropped.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/file-drop/OnFileDropped/) (ukadoc-spec/list/shiori-event/file-drop/OnFileDropped.md)
- **検索語**: OnFileDropped
- **対応状況**: ⚠️ 一部対応

## 突合結果

OnFileDropped ファイルドロップ/外部連携SHIORIイベント通知処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify).

## 実装箇所

- `ui/ts/ghost/shiori-protocol.ts:102` `FILE_DROPPED: "OnFileDropped",`
- `ui/ts/ghost/shiori-notify/input-events.ts:34` `| "OnFileDropped"`
