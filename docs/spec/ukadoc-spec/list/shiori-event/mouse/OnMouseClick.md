# OnMouseClick

- **規格**: [OnMouseClick.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/mouse/OnMouseClick/) (ukadoc-spec/list/shiori-event/mouse/OnMouseClick.md)
- **検索語**: OnMouseClick
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/js/ghost/shiori-protocol.js:8` (コメント) `* @param {string} id - イベントID (例: "OnBoot", "OnMouseClick")`
- `ui/js/core/app-events.js:136` (コメント) `// つつき反応が無かった場合は OnMouseClick もフォールバック送信`
- `ui/js/core/app-events.js:138` `this.ghostController.sendShioriEvent("OnMouseClick", args);`
- `src-tauri/src/shiori/ffi.rs:220` (コメント) `/// OnMouseClickイベントのリクエストを作成`
- `src-tauri/src/shiori/ffi.rs:224` `.header("Event", "OnMouseClick")`
