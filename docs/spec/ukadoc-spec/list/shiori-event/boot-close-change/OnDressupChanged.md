# OnDressupChanged

- **規格**: [OnDressupChanged.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnDressupChanged/) (ukadoc-spec/list/shiori-event/boot-close-change/OnDressupChanged.md)
- **検索語**: OnDressupChanged
- **対応状況**: ✅ 実装済

## 突合結果

OnDressupChanged SHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify)。

## 実装箇所

- `ui/js/ghost/shiori-notify.js:17` `* - OnClose, OnCloseAll, OnDestroy, OnDressupChanged, OnFirstBoot, OnFullScreenA`
- `ui/js/surface/surface-dressup.js:50` `await this.app.ghostController.sendShioriEvent("OnDressupChanged", [`
