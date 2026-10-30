# OnClose

- **規格**: [OnClose.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnClose/) (ukadoc-spec/list/shiori-event/boot-close-change/OnClose.md)
- **検索語**: OnClose
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `src-tauri/src/shiori/ffi/builder.rs:84` `.event("OnClose")`
- `crates/ui/src/shiori/protocol/request.rs:185` `let notify_req = ShioriRequest::notify("OnClose", &[]);`
- `crates/ui/src/shiori/protocol/request.rs:187` `assert_eq!(notify_req.id, "OnClose");`
- `ui/main.js:165` `await this.ghostController.sendShioriEvent("OnClose");`
- `tests/main.test.js:135` `throw new Error("OnClose error");`
