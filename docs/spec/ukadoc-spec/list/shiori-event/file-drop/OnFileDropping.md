# OnFileDropping

- **規格**: [OnFileDropping.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/file-drop/OnFileDropping/) (ukadoc-spec/list/shiori-event/file-drop/OnFileDropping.md)
- **検索語**: OnFileDropping
- **対応状況**: ⚠️ 一部対応

## 突合結果

OnFileDropping ファイルドロップ/外部連携SHIORIイベント通知処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify).

## 実装箇所

- `ui/ts/ghost/shiori-protocol.ts:103` `FILE_DROPPING: "OnFileDropping",`
- `ui/ts/ghost/shiori-notify/input-events.ts:35` `| "OnFileDropping"`
