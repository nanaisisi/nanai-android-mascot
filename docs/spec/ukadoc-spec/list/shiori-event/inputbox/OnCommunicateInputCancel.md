# OnCommunicateInputCancel

- **規格**: [OnCommunicateInputCancel.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/inputbox/OnCommunicateInputCancel/) (ukadoc-spec/list/shiori-event/inputbox/OnCommunicateInputCancel.md)
- **検索語**: OnCommunicateInputCancel
- **対応状況**: ✅ 実装済

## 突合結果

コミュニケートボックスのキャンセル/消去時に `OnCommunicateInputCancel` SHIORIイベントを送信する処理を実装 (`ui/ts/ghost/command-handler/communicatebox.ts` -> `OnCommunicateInputCancel`)。

## 実装箇所

- `crates/nanai-core/src/shiori_protocol_helpers/events/input.rs:199` `pub fn build_on_communicate_input_cancel_request`
- `ui/ts/ghost/command-handler/communicatebox.ts:92` `await handler.app.ghostController?.sendShioriEvent("OnCommunicateInputCancel",`
- `ui/ts/ghost/command-handler/communicatebox.ts:133` `handler.app.ghostController?.sendShioriEvent("OnCommunicateInputCancel",`
- `ui/ts/ui/renderers/modal-dialog-communication.ts:297` `this.app?.ghostController?.sendShioriEvent?.("OnCommunicateInputCancel",`
