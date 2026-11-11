# OnDirectoryDrop

- **規格**: [OnDirectoryDrop.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/file-drop/OnDirectoryDrop/) (ukadoc-spec/list/shiori-event/file-drop/OnDirectoryDrop.md)
- **検索語**: OnDirectoryDrop
- **対応状況**: ⚠️ 一部対応

## 突合結果

OnDirectoryDrop ファイルドロップ/外部連携SHIORIイベント通知処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify).

## 実装箇所

- `ui/ts/ghost/shiori-protocol.ts:104` `DIRECTORY_DROP: "OnDirectoryDrop",`
- `ui/ts/ghost/shiori-notify/input-events.ts:36` `| "OnDirectoryDrop"`
