# OnFileDropEx

- **規格**: [OnFileDropEx.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/file-drop/OnFileDropEx/) (ukadoc-spec/list/shiori-event/file-drop/OnFileDropEx.md)
- **検索語**: OnFileDropEx
- **対応状況**: ⚠️ 一部対応

## 突合結果

OnFileDropEx ファイルドロップ/外部連携SHIORIイベント通知処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify).

## 実装箇所

- `ui/ts/ghost/shiori-protocol.ts:101` `FILE_DROP_EX: "OnFileDropEx",`
- `ui/ts/ghost/shiori-notify/input-events.ts:33` `| "OnFileDropEx"`
