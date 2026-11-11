# OnUpdateFailure

- **規格**: [OnUpdateFailure.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateFailure/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateFailure.md)
- **検索語**: OnUpdateFailure
- **対応状況**: ⚠️ 一部対応

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `crates/nanai-core/src/update_protocol.rs:132` `/// OnUpdateFailure SHIORI 引数生成 (UKADOC準拠)`
- `ui/ts/core/app-update.ts:49` `await gc.sendShioriEvent("OnUpdateFailure", buildUpdateArgs("fileio"));`
- `ui/ts/core/app-update.ts:157` `"OnUpdateFailure",`
- `ui/ts/core/app-update.ts:202` `await gc.sendShioriEvent("OnUpdateFailure", buildUpdateArgs(reason));`
- `ui/ts/core/actions/update-protocol.ts:6` `* - OnUpdateBegin / OnUpdateReady / OnUpdateComplete / OnUpdateFailure`
