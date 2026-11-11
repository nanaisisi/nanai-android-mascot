# OnUpdateBegin

- **規格**: [OnUpdateBegin.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateBegin/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateBegin.md)
- **検索語**: OnUpdateBegin
- **対応状況**: ⚠️ 一部対応

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `crates/nanai-core/src/update_protocol.rs:26` `"OnUpdateBegin",`
- `ui/ts/core/app-update.ts:37` `"OnUpdateBegin",`
- `ui/ts/core/actions/update-protocol.ts:6` `* - OnUpdateBegin / OnUpdateReady / OnUpdateComplete / OnUpdateFailure`
- `ui/ts/core/actions/update-protocol.ts:88` `"OnUpdateBegin",`
