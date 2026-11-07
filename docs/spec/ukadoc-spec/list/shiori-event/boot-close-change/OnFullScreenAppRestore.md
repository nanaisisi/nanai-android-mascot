# OnFullScreenAppRestore

- **規格**: [OnFullScreenAppRestore.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnFullScreenAppRestore/) (ukadoc-spec/list/shiori-event/boot-close-change/OnFullScreenAppRestore.md)
- **検索語**: OnFullScreenAppRestore
- **対応状況**: ✅ 実装済

## 突合結果

OnFullScreenAppRestore SHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify)。

## 実装箇所

- `ui/ts/ghost/shiori-notify.ts:684` `return await this.sendShioriNotify("OnFullScreenAppRestore", []);`
