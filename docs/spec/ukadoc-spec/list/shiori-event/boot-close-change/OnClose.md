# OnClose

- **規格**: [OnClose.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnClose/) (ukadoc-spec/list/shiori-event/boot-close-change/OnClose.md)
- **検索語**: OnClose
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `src-tauri/src/shiori/ffi/builder.rs:84` `.event("OnClose")`
- `ui/main.js:183` `await this.ghostController.sendShioriEvent("OnClose");`
