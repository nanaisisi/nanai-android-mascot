# OnFullScreenAppMinimize

- **規格**: [OnFullScreenAppMinimize.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnFullScreenAppMinimize/) (ukadoc-spec/list/shiori-event/boot-close-change/OnFullScreenAppMinimize.md)
- **検索語**: OnFullScreenAppMinimize
- **対応状況**: ✅ 実装済

## 突合結果

OnFullScreenAppMinimize SHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify)。

## 実装箇所

- `ui/ts/ghost/shiori-notify.ts:680` `return await this.sendShioriNotify("OnFullScreenAppMinimize", []);`
