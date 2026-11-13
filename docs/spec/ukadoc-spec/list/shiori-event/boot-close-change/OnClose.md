# OnClose

- **規格**: [OnClose.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnClose/) (ukadoc-spec/list/shiori-event/boot-close-change/OnClose.md)
- **検索語**: OnClose
- **対応状況**: ⚠️ 一部対応

## 突合結果

OnClose SHIORIイベント送信処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify)。

## 実装箇所

- `src-tauri/src/shiori/ffi/builder.rs:84` `.event("OnClose")`
- `crates/nanai-core/src/shiori_protocol.rs:98` `/// OnClose イベントリクエスト構築`
- `crates/nanai-core/src/shiori_protocol.rs:101` `build_shiori_request_extended("GET", "OnClose", &refs, None)`
- `crates/nanai-shiori-vm/src/lib.rs:41` `if request.contains("ID: OnClose") {`
- `crates/nanai-shiori-vm/src/lib.rs:208` `let res_close = state.handle_request("GET SHIORI/3.0\r\nID: OnClose\r\n\r\n");`
