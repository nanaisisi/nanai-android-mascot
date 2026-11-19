# OnTeachInputCancel

- **規格**: [OnTeachInputCancel.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/inputbox/OnTeachInputCancel/) (ukadoc-spec/list/shiori-event/inputbox/OnTeachInputCancel.md)
- **検索語**: OnTeachInputCancel
- **対応状況**: ✅ 実装済

## 突合結果

ティーチボックスのキャンセル時に `OnTeachInputCancel` SHIORIイベントを送信する処理を実装 (`ui/ts/ghost/command-handler/teachbox.ts` -> `OnTeachInputCancel`)。

## 実装箇所

- `crates/nanai-core/src/shiori_protocol_helpers/events/input.rs:189` `pub fn build_on_teach_input_cancel_request`
- `ui/ts/ghost/command-handler/teachbox.ts:73` `await handler.app.ghostController?.sendShioriEvent("OnTeachInputCancel", [`
- `ui/ts/ui/renderers/modal-dialog-communication.ts:92` `await this.app?.ghostController?.sendShioriEvent?.("OnTeachInputCancel", [`
