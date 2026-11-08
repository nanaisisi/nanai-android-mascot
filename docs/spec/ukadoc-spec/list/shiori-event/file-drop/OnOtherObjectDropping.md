# OnOtherObjectDropping

- **規格**: [OnOtherObjectDropping.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/file-drop/OnOtherObjectDropping/) (ukadoc-spec/list/shiori-event/file-drop/OnOtherObjectDropping.md)
- **検索語**: OnOtherObjectDropping
- **対応状況**: ✅ 実装済

## 突合結果

OnOtherObjectDropping ファイルドロップ/外部連携SHIORIイベント通知処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify).

## 実装箇所

- `ui/ts/ghost/shiori-notify.ts:254` `| "OnOtherObjectDropping"`
- `ui/ts/ghost/shiori-protocol.ts:112` `OTHER_OBJECT_DROPPING: "OnOtherObjectDropping",`
