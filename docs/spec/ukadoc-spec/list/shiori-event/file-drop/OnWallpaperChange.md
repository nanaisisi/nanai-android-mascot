# OnWallpaperChange

- **規格**: [OnWallpaperChange.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/file-drop/OnWallpaperChange/) (ukadoc-spec/list/shiori-event/file-drop/OnWallpaperChange.md)
- **検索語**: OnWallpaperChange
- **対応状況**: ⚠️ 一部対応

## 突合結果

OnWallpaperChange ファイルドロップ/外部連携SHIORIイベント通知処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify).

## 実装箇所

- `ui/ts/ghost/shiori-protocol.ts:114` `WALLPAPER_CHANGE: "OnWallpaperChange",`
- `ui/ts/ghost/shiori-notify/input-events.ts:46` `| "OnWallpaperChange"`
