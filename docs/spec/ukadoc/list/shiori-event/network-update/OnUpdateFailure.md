# OnUpdateFailure

- **規格**: [OnUpdateFailure.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateFailure/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateFailure.md)
- **検索語**: OnUpdateFailure
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/js/core/app-update.js:16` (コメント) `* 失敗時は随時 OnUpdateFailure (Reference0: failure_reason)`
- `ui/js/core/app-update.js:46` `await gc.sendShioriEvent("OnUpdateFailure", ["fileio", "", "", "ghost", "manual"]);`
- `ui/js/core/app-update.js:84` `await gc.sendShioriEvent("OnUpdateFailure", [failureReason, "", "", "ghost", "manual"]);`
- `ui/js/core/app-update.js:91` `await gc.sendShioriEvent("OnUpdateFailure", [reason, "", "", "ghost", "manual"]);`
