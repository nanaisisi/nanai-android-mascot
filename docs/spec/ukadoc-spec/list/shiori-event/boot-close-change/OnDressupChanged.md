# OnDressupChanged

- **規格**: [OnDressupChanged.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnDressupChanged/) (ukadoc-spec/list/shiori-event/boot-close-change/OnDressupChanged.md)
- **検索語**: OnDressupChanged
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/js/surface/surface-dressup.js:50` `await this.app.ghostController.sendShioriEvent("OnDressupChanged", [`
- `tests/surface-dressup.test.js:46` `assert.ok(eventsSent.some((e) => e.ev === "OnDressupChanged"));`
