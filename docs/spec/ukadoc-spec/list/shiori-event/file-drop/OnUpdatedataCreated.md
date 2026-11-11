# OnUpdatedataCreated

- **規格**: [OnUpdatedataCreated.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/file-drop/OnUpdatedataCreated/) (ukadoc-spec/list/shiori-event/file-drop/OnUpdatedataCreated.md)
- **検索語**: OnUpdatedataCreated
- **対応状況**: ⚠️ 一部対応

## 突合結果

OnUpdatedataCreated ファイルドロップ/外部連携SHIORIイベント通知処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify).

## 実装箇所

- `ui/ts/ghost/shiori-protocol.ts:111` `UPDATEDATA_CREATED: "OnUpdatedataCreated",`
- `ui/ts/ghost/shiori-notify/input-events.ts:43` `| "OnUpdatedataCreated"`
