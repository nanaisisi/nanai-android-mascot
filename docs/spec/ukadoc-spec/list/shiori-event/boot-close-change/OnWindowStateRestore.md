# OnWindowStateRestore

- **規格**: [OnWindowStateRestore.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnWindowStateRestore/) (ukadoc-spec/list/shiori-event/boot-close-change/OnWindowStateRestore.md)
- **検索語**: OnWindowStateRestore
- **対応状況**: ✅ 実装済

## 突合結果

OnWindowStateRestore SHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify)。

## 実装箇所

- `src-tauri/src/shiori/ffi/builder.rs:122` `.event("OnWindowStateRestore")`
- `ui/js/core/app-settings.js:82` `this.ghostController.sendShioriEvent("OnWindowStateRestore");`
- `ui/js/ghost/shiori-notify.js:20` `* - OnSysResume, OnSysSuspend, OnVirtualDesktopChanged, OnWindowStateMinimize, O`
