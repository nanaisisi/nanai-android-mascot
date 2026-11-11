# OnMediaPlayerOpen

- **規格**: [OnMediaPlayerOpen.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/file-drop/OnMediaPlayerOpen/) (ukadoc-spec/list/shiori-event/file-drop/OnMediaPlayerOpen.md)
- **検索語**: OnMediaPlayerOpen
- **対応状況**: ⚠️ 一部対応

## 突合結果

OnMediaPlayerOpen ファイルドロップ/外部連携SHIORIイベント通知処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify).

## 実装箇所

- `ui/ts/ghost/shiori-protocol.ts:106` `MEDIA_PLAYER_OPEN: "OnMediaPlayerOpen",`
- `ui/ts/ghost/shiori-notify/input-events.ts:38` `| "OnMediaPlayerOpen"`
