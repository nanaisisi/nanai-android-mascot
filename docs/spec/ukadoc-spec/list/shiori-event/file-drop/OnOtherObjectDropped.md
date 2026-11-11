# OnOtherObjectDropped

- **規格**: [OnOtherObjectDropped.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/file-drop/OnOtherObjectDropped/) (ukadoc-spec/list/shiori-event/file-drop/OnOtherObjectDropped.md)
- **検索語**: OnOtherObjectDropped
- **対応状況**: ⚠️ 一部対応

## 突合結果

OnOtherObjectDropped ファイルドロップ/外部連携SHIORIイベント通知処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify).

## 実装箇所

- `ui/ts/ghost/shiori-protocol.ts:113` `OTHER_OBJECT_DROPPED: "OnOtherObjectDropped",`
- `ui/ts/ghost/shiori-notify/input-events.ts:45` `| "OnOtherObjectDropped"`
