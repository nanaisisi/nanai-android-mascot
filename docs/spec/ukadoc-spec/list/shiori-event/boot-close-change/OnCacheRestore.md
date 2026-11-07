# OnCacheRestore

- **規格**: [OnCacheRestore.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnCacheRestore/) (ukadoc-spec/list/shiori-event/boot-close-change/OnCacheRestore.md)
- **検索語**: OnCacheRestore
- **対応状況**: ✅ 実装済

## 突合結果

OnCacheRestore SHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify)。

## 実装箇所

- `ui/ts/ghost/shiori-notify.ts:700` `return await this.sendShioriNotify("OnCacheRestore", []);`
