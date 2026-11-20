# OnSystemDialogCancel

- **規格**: [OnSystemDialogCancel.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/dialogbox/OnSystemDialogCancel/) (ukadoc-spec/list/shiori-event/dialogbox/OnSystemDialogCancel.md)
- **検索語**: OnSystemDialogCancel
- **対応状況**: ✅ 実装済

## 突合結果

システムダイアログのキャンセル/消去時に `OnSystemDialogCancel` SHIORIイベントを送信する処理を実装 (`ui/ts/ui/renderers/modal-dialog-system.ts` -> `OnSystemDialogCancel`)。

## 実装箇所

- `crates/nanai-core/src/shiori_protocol_helpers/events/system.rs:280` `pub fn build_on_system_dialog_cancel_request`
- `ui/ts/ghost/shiori-protocol.ts:163` `SYSTEM_DIALOG_CANCEL: "OnSystemDialogCancel"`
- `ui/ts/ghost/command-handler/inputbox.ts:80` `handler.app.ghostController?.sendShioriEvent("OnSystemDialogCancel", [`
- `ui/ts/ui/renderers/modal-dialog-choices.ts:33` `this.app?.ghostController?.sendShioriEvent?.("OnSystemDialogCancel", [`
- `ui/ts/ui/renderers/modal-dialog-system.ts:104` `"OnSystemDialogCancel"`
