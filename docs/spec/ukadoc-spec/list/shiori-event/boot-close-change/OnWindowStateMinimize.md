# OnWindowStateMinimize

- **規格**: [OnWindowStateMinimize.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnWindowStateMinimize/) (ukadoc-spec/list/shiori-event/boot-close-change/OnWindowStateMinimize.md)
- **検索語**: OnWindowStateMinimize
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `src-tauri/src/shiori/ffi/builder.rs:115` `.event("OnWindowStateMinimize")`
- `ui/js/core/actions/ghost-actions.js:207` `this.ghostController.sendShioriEvent("OnWindowStateMinimize");`
