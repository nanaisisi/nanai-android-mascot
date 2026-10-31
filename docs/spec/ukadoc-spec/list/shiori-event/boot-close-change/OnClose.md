# OnClose

- **規格**: [OnClose.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnClose/) (ukadoc-spec/list/shiori-event/boot-close-change/OnClose.md)
- **検索語**: OnClose
- **対応状況**: ✅ 実装済

## 突合結果

OnClose SHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify)。

## 実装箇所

- `src-tauri/src/shiori/ffi/builder.rs:84` `.event("OnClose")`
- `crates/ui/src/shiori/protocol/request.rs:185` `let notify_req = ShioriRequest::notify("OnClose", &[]);`
- `crates/ui/src/shiori/protocol/request.rs:187` `assert_eq!(notify_req.id, "OnClose");`
- `ui/main.js:181` `await this.ghostController.sendShioriEvent("OnClose");`
- `ui/js/ghost/shiori-notify.js:17` `* - OnClose, OnCloseAll, OnDestroy, OnDressupChanged, OnFirstBoot, OnFullScreenA`
