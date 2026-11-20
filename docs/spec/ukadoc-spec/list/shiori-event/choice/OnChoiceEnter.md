# OnChoiceEnter

- **規格**: [OnChoiceEnter.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/choice/OnChoiceEnter/) (ukadoc-spec/list/shiori-event/choice/OnChoiceEnter.md)
- **検索語**: OnChoiceEnter
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\q` (選択肢ボタン) 上にマウスカーソルが乗った際 (`mouseenter`)、および外れた際 (`mouseleave`) に `OnChoiceEnter` SHIORIイベントを送信するイベントハンドラを実装 (`ui/js/ghost/sakura-play/handlers.js` -> `OnChoiceEnter`)。

## 実装箇所

- `crates/nanai-core/src/shiori_protocol_helpers/events/input.rs:79` `/// OnChoiceEnter イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnChoiceEnte`
- `ui/ts/ghost/shiori-protocol.ts:150` `CHOICE_ENTER: "OnChoiceEnter",`
- `crates/nanai-core/src/shiori_protocol_helpers/events/input.rs:84` `event_id: "OnChoiceEnter",`
- `crates/nanai-core/src/shiori_protocol_helpers/tests/events.rs:28` `assert!(choice_enter.contains("ID: OnChoiceEnter"));`
