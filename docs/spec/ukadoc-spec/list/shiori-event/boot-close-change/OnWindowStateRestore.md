# OnWindowStateRestore

- **規格**: [OnWindowStateRestore.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnWindowStateRestore/) (ukadoc-spec/list/shiori-event/boot-close-change/OnWindowStateRestore.md)
- **検索語**: OnWindowStateRestore
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `src-tauri/src/shiori/ffi/builder.rs:122` `.event("OnWindowStateRestore")`
- `ui/js/core/app-settings.js:82` `this.ghostController.sendShioriEvent("OnWindowStateRestore");`
