# OnWindowStateRestore

- **規格**: [OnWindowStateRestore.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnWindowStateRestore/) (ukadoc-spec/list/shiori-event/boot-close-change/OnWindowStateRestore.md)
- **検索語**: OnWindowStateRestore
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/js/core/app-settings.js:62`  `this.ghostController.sendShioriEvent("OnWindowStateRestore");`
- `src-tauri/src/shiori/ffi.rs:255` (コメント) `/// OnWindowStateRestoreイベントのリクエストを作成`
- `src-tauri/src/shiori/ffi.rs:259`  `.header("Event", "OnWindowStateRestore")`
