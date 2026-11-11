# OnPictureViewerOpen

- **規格**: [OnPictureViewerOpen.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/file-drop/OnPictureViewerOpen/) (ukadoc-spec/list/shiori-event/file-drop/OnPictureViewerOpen.md)
- **検索語**: OnPictureViewerOpen
- **対応状況**: ⚠️ 一部対応

## 突合結果

OnPictureViewerOpen ファイルドロップ/外部連携SHIORIイベント通知処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify).

## 実装箇所

- `ui/ts/ghost/shiori-protocol.ts:107` `PICTURE_VIEWER_OPEN: "OnPictureViewerOpen",`
- `ui/ts/ghost/shiori-notify/input-events.ts:39` `| "OnPictureViewerOpen"`
