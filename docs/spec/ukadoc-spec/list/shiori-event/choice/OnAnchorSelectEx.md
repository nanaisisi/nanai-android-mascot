# OnAnchorSelectEx

- **規格**: [OnAnchorSelectEx.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/choice/OnAnchorSelectEx/) (ukadoc-spec/list/shiori-event/choice/OnAnchorSelectEx.md)
- **検索語**: OnAnchorSelectEx
- **対応状況**: ⚠️ 一部対応

## 突合結果

OnAnchorSelectEx 選択肢/アンカー関連SHIORIイベント処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify, crates/ui/src/script/command.rs).

## 実装箇所

- `crates/nanai-core/src/shiori_protocol_core/events.rs:117` `OnAnchorSelectEx,`
- `ui/ts/core/wasm/pkg/nanai_core.d.ts:211` `export type ChoiceAnchorEvent = "OnChoiceSelectEx" | "OnAnchorSelectEx";`
- `crates/nanai-core/src/shiori_protocol_helpers/events/input.rs:68` `/// OnAnchorSelectEx イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnAnchorS`
- `ui/ts/ghost/shiori-protocol.ts:154` `ANCHOR_SELECT_EX: "OnAnchorSelectEx",`
- `crates/nanai-core/src/shiori_protocol_helpers/events/input.rs:73` `event_id: "OnAnchorSelectEx",`
- `ui/ts/ghost/shiori-notify/balloon-surface.ts:30` `event: "OnChoiceSelectEx" | "OnAnchorSelectEx" | string,`
