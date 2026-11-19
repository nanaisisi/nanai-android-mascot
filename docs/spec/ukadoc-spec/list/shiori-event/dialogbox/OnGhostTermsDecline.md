# OnGhostTermsDecline

- **規格**: [OnGhostTermsDecline.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/dialogbox/OnGhostTermsDecline/) (ukadoc-spec/list/shiori-event/dialogbox/OnGhostTermsDecline.md)
- **検索語**: OnGhostTermsDecline
- **対応状況**: ✅ 実装済

## 突合結果

ゴースト利用条件（規約）拒否時に `OnGhostTermsDecline` SHIORIイベントを送信する処理を実装 (`ui/ts/ghost/shiori-notify/ghost-lifecycle/terms.ts` -> `sendGhostTermsDecline`).

## 実装箇所

- `crates/nanai-core/src/shiori_protocol_core/events.rs:145` `OnGhostTermsDecline,`
- `ui/ts/ghost/shiori-protocol.ts:161` `GHOST_TERMS_DECLINE: "OnGhostTermsDecline"`
- `ui/ts/ghost/shiori-notify/ghost-lifecycle/terms.ts:32` `return await this.sendShioriNotify("OnGhostTermsDecline", id ? [id] : []);`
- `ui/ts/ui/renderers/modal-dialog-ui.ts:200` `"OnGhostTermsDecline"`
