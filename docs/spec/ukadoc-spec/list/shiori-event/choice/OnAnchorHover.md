# OnAnchorHover

- **規格**: [OnAnchorHover.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/choice/OnAnchorHover/) (ukadoc-spec/list/shiori-event/choice/OnAnchorHover.md)
- **検索語**: OnAnchorHover
- **対応状況**: ⚠️ 一部対応

## 突合結果

OnAnchorHover 選択肢/アンカー関連SHIORIイベント処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify, crates/ui/src/script/command.rs).

## 実装箇所

- `crates/nanai-core/src/shiori_protocol_helpers/events/input.rs:112` `/// OnAnchorHover イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnAnchorHove`
- `ui/ts/ghost/shiori-protocol.ts:156` `ANCHOR_HOVER: "OnAnchorHover",`
- `crates/nanai-core/src/shiori_protocol_helpers/events/input.rs:117` `event_id: "OnAnchorHover",`
- `crates/nanai-core/src/shiori_protocol_helpers/tests/events.rs:37` `assert!(anchor_hover.contains("ID: OnAnchorHover"));`
