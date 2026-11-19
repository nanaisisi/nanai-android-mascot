# OnCommunicate

- **規格**: [OnCommunicate.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/inputbox/OnCommunicate/) (ukadoc-spec/list/shiori-event/inputbox/OnCommunicate.md)
- **検索語**: OnCommunicate
- **対応状況**: ✅ 実装済

## 突合結果

コミュニケートボックス送信時に `OnCommunicate` SHIORIイベント (Reference0: "user", Reference1: 送信テキスト) を送信する処理を実装 (`ui/ts/ghost/command-handler/communicatebox.ts` -> `sendShioriEvent`)。

## 実装箇所

- `crates/nanai-core/src/shiori_protocol_helpers/events/input.rs:145` `pub fn build_on_communicate_request`
- `crates/ui/src/shiori/protocol/response/types.rs:37` `/// Reference1..N（互換性のため Reference1 = 通信先 OnCommunicate の Reference2）`
- `ui/ts/ghost/command-handler/communicatebox.ts:83` `await handler.app.ghostController?.sendShioriEvent("OnCommunicate", [`
