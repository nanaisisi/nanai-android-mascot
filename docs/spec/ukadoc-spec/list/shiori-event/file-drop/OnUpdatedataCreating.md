# OnUpdatedataCreating

- **規格**: [OnUpdatedataCreating.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/file-drop/OnUpdatedataCreating/) (ukadoc-spec/list/shiori-event/file-drop/OnUpdatedataCreating.md)
- **検索語**: OnUpdatedataCreating
- **対応状況**: ✅ 実装済

## 突合結果

OnUpdatedataCreating ファイルドロップ/外部連携SHIORIイベント通知処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify).

## 実装箇所

- `ui/ts/ghost/shiori-notify.ts:252` `| "OnUpdatedataCreating"`
- `ui/ts/ghost/shiori-protocol.ts:110` `UPDATEDATA_CREATING: "OnUpdatedataCreating",`
