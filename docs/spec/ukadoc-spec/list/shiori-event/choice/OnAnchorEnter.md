# OnAnchorEnter

- **規格**: [OnAnchorEnter.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/choice/OnAnchorEnter/) (ukadoc-spec/list/shiori-event/choice/OnAnchorEnter.md)
- **検索語**: OnAnchorEnter
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\_a` (アンカー要素) 上にマウスカーソルが乗った際 (`mouseenter`)、および外れた際 (`mouseleave`) に `OnAnchorEnter` SHIORIイベントを送信するイベントハンドラを実装 (`ui/js/ghost/sakura-play/handlers.js` -> `OnAnchorEnter`)。

- マウス進入時: Reference0: ジャンパテキスト, Reference1: ジャンパID, Reference2..: 拡張引数
- マウス退出時: 引数なし (空Reference)

## 実装箇所

- `crates/nanai-core/src/shiori_protocol_helpers/events/input.rs:101` `/// OnAnchorEnter イベントリクエスト構築 (ukadoc-spec/list/shiori-event/choice/OnAnchorEnte`
- `ui/ts/ghost/shiori-protocol.ts:155` `ANCHOR_ENTER: "OnAnchorEnter",`
- `crates/nanai-core/src/shiori_protocol_helpers/events/input.rs:106` `event_id: "OnAnchorEnter",`
- `crates/nanai-core/src/shiori_protocol_helpers/tests/events.rs:34` `assert!(anchor_enter.contains("ID: OnAnchorEnter"));`
- `ui/ts/ghost/sakura-script.ts` `addAnchorToBalloon` (`mouseenter` / `mouseleave` で `OnAnchorEnter` を送信)
