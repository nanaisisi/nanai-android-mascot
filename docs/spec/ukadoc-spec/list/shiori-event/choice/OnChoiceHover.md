# OnChoiceHover

- **規格**: [OnChoiceHover.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/choice/OnChoiceHover/) (ukadoc-spec/list/shiori-event/choice/OnChoiceHover.md)
- **検索語**: OnChoiceHover
- **対応状況**: ⚠️ 一部対応

## 突合結果

OnChoiceHover 選択肢/アンカー関連SHIORIイベント処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify, crates/ui/src/script/command.rs).

## 実装箇所

- `crates/nanai-core/src/shiori_protocol_helpers/events/input.rs:90` `/// OnChoiceHover イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnChoiceHove`
- `ui/ts/ghost/shiori-protocol.ts:151` `CHOICE_HOVER: "OnChoiceHover",`
- `crates/nanai-core/src/shiori_protocol_helpers/events/input.rs:95` `event_id: "OnChoiceHover",`
- `crates/nanai-core/src/shiori_protocol_helpers/tests/events.rs:31` `assert!(choice_hover.contains("ID: OnChoiceHover"));`
