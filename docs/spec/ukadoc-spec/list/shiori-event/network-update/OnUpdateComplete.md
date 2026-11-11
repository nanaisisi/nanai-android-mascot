# OnUpdateComplete

- **規格**: [OnUpdateComplete.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateComplete/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateComplete.md)
- **検索語**: OnUpdateComplete
- **対応状況**: ✅ 実装済

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `crates/nanai-core/src/update_protocol.rs:31` `"OnUpdateComplete",`
- `crates/nanai-core/src/update_protocol.rs:109` `/// OnUpdateComplete SHIORI 引数生成 (UKADOC準拠)`
- `ui/ts/core/app-update.ts:92` `await gc.sendShioriEvent("OnUpdateComplete", buildUpdateArgs("none"));`
- `ui/ts/core/app-update.ts:137` `"OnUpdateComplete",`
- `ui/ts/core/actions/update-protocol.ts:6` `* - OnUpdateBegin / OnUpdateReady / OnUpdateComplete / OnUpdateFailure`
