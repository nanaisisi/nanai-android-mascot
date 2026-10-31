# OnWindowStateMinimize

- **規格**: [OnWindowStateMinimize.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnWindowStateMinimize/) (ukadoc-spec/list/shiori-event/boot-close-change/OnWindowStateMinimize.md)
- **検索語**: OnWindowStateMinimize
- **対応状況**: ✅ 実装済

## 突合結果

OnWindowStateMinimize SHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify)。

## 実装箇所

- `src-tauri/src/shiori/ffi/builder.rs:115` `.event("OnWindowStateMinimize")`
- `ui/js/core/actions/ghost-actions.js:207` `this.ghostController.sendShioriEvent("OnWindowStateMinimize");`
- `ui/js/ghost/shiori-notify.js:20` `* - OnSysResume, OnSysSuspend, OnVirtualDesktopChanged, OnWindowStateMinimize, O`
