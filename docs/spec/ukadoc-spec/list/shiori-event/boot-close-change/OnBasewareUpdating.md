# OnBasewareUpdating

- **規格**: [OnBasewareUpdating.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnBasewareUpdating/) (ukadoc-spec/list/shiori-event/boot-close-change/OnBasewareUpdating.md)
- **検索語**: OnBasewareUpdating
- **対応状況**: ✅ 実装済

## 突合結果

OnBasewareUpdating SHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify)。

## 実装箇所

- `ui/ts/ghost/shiori-notify.ts:688` `return await this.sendShioriNotify("OnBasewareUpdating", []);`
