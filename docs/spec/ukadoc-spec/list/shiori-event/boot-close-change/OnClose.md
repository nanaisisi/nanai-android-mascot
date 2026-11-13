# OnClose

- **規格**: [OnClose.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnClose/) (ukadoc-spec/list/shiori-event/boot-close-change/OnClose.md)
- **検索語**: OnClose
- **対応状況**: ✅ 実装済

## 突合結果

OnClose SHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify)。

## 実装箇所

- `crates/nanai-core/src/shiori_protocol.rs:98` `/// OnClose イベントリクエスト構築`
- `src-tauri/src/shiori/ffi/builder.rs:84` `.event("OnClose")`
- `ui/main.ts:9` `* - OnBoot, OnClose, OnWindowStateMinimize, OnWindowStateRestore`
- `ui/ts/ui/modal-settings-handlers.ts:258` `bindShioriTestButton("test-shiori-finalize", "OnClose", "SHIORI終了");`
- `tests/main/close-app.test.ts:50` `throw new Error("OnClose error");`
- `crates/nanai-core/src/shiori_protocol.rs:101` `build_shiori_request_extended("GET", "OnClose", &refs, None)`
