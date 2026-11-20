# OnGhostTermsAccept

- **規格**: [OnGhostTermsAccept.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/dialogbox/OnGhostTermsAccept/) (ukadoc-spec/list/shiori-event/dialogbox/OnGhostTermsAccept.md)
- **検索語**: OnGhostTermsAccept
- **対応状況**: ✅ 実装済

## 突合結果

ゴースト利用条件（規約）受諾時に `OnGhostTermsAccept` SHIORIイベントを送信する処理を実装 (`ui/ts/ghost/shiori-notify/ghost-lifecycle/terms.ts` -> `sendGhostTermsAccept`).

## 実装箇所

- `crates/nanai-core/src/shiori_protocol_core/events.rs:144` `OnGhostTermsAccept,`
- `ui/ts/ghost/shiori-protocol.ts:160` `GHOST_TERMS_ACCEPT: "OnGhostTermsAccept"`
- `ui/ts/ghost/shiori-notify/ghost-lifecycle/terms.ts:25` `return await this.sendShioriNotify("OnGhostTermsAccept", id ? [id] : []);`
- `ui/ts/ui/renderers/modal-dialog-system.ts:169` `"OnGhostTermsAccept"`
