# OnMinuteChange

- **規格**: [OnMinuteChange.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/time/OnMinuteChange/) (ukadoc-spec/list/shiori-event/time/OnMinuteChange.md)
- **検索語**: OnMinuteChange
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/js/core/app-settings.js:72`  `await this.ghostController.sendShioriEvent("OnMinuteChange");`
- `src-tauri/src/shiori/ffi.rs:239` (コメント) `/// OnMinuteChangeイベントのリクエストを作成`
- `src-tauri/src/shiori/ffi.rs:243`  `.header("Event", "OnMinuteChange")`
