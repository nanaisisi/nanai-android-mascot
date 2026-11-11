# OnMouseClick

- **規格**: [OnMouseClick.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/mouse/OnMouseClick/) (ukadoc-spec/list/shiori-event/mouse/OnMouseClick.md)
- **検索語**: OnMouseClick
- **対応状況**: ✅ 実装済

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `src-tauri/src/shiori/ffi/builder.rs:91` `.event("OnMouseClick")`
- `src-tauri/src/shiori/ffi/builder.rs:217` `assert!(req.contains("OnMouseClick"));`
- `crates/ui/src/shiori/engine/mock.rs:25` `"OnMouseClick".to_string(),`
- `ui/ts/core/events/mouse.ts:37` `"OnMouseClick",`
- `tests/app-events.test.ts:207` `// Test onGhostClick fallback to OnMouseClick when double click has no script`
