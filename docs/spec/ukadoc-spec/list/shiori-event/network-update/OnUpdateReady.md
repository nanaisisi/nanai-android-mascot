# OnUpdateReady

- **規格**: [OnUpdateReady.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateReady/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateReady.md)
- **検索語**: OnUpdateReady
- **対応状況**: ⚠️ 一部対応

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `crates/nanai-core/src/update_protocol.rs:27` `"OnUpdateReady",`
- `ui/ts/core/app-update.ts:105` `"OnUpdateReady",`
- `ui/ts/core/actions/update-protocol.ts:6` `* - OnUpdateBegin / OnUpdateReady / OnUpdateComplete / OnUpdateFailure`
- `ui/ts/core/actions/update-protocol.ts:89` `"OnUpdateReady",`
