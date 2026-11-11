# OnUpdateProcessExec

- **規格**: [OnUpdateProcessExec.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateProcessExec/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateProcessExec.md)
- **検索語**: OnUpdateProcessExec
- **対応状況**: ✅ 実装済

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `crates/nanai-core/src/update_protocol.rs:25` `"OnUpdateProcessExec",`
- `ui/ts/core/app-update.ts:25` `const execRes: unknown = await gc.sendShioriEvent("OnUpdateProcessExec", [`
- `ui/ts/core/app-update.ts:30` `"OnUpdateProcessExec でスクリプトが返されたため標準処理を委譲",`
- `ui/ts/core/actions/update-protocol.ts:11` `* - OnUpdateProcessExec / OnUpdateResult / OnUpdateResultEx / OnUpdateResultExpl`
- `ui/ts/core/actions/update-protocol.ts:87` `"OnUpdateProcessExec",`
