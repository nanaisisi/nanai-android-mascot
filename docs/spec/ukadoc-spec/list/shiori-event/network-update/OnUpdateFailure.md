# OnUpdateFailure

- **規格**: [OnUpdateFailure.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateFailure/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateFailure.md)
- **検索語**: OnUpdateFailure
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/js/core/app-update.js:17` `* 失敗時は随時 OnUpdateFailure (Reference0: failure_reason)`
- `ui/js/core/app-update.js:66` `await gc.sendShioriEvent("OnUpdateFailure", [`
- `ui/js/core/app-update.js:219` `await gc.sendShioriEvent("OnUpdateFailure", [`
- `ui/js/core/app-update.js:266` `await gc.sendShioriEvent("OnUpdateFailure", [`
