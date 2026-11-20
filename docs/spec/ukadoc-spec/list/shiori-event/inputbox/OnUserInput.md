# OnUserInput

- **規格**: [OnUserInput.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/inputbox/OnUserInput/) (ukadoc-spec/list/shiori-event/inputbox/OnUserInput.md)
- **検索語**: OnUserInput
- **対応状況**: ✅ 実装済

## 突合結果

単一行入力ボックス決定時・音声入力決定時に `OnUserInput` SHIORIイベントを送信する処理を実装 (`ui/ts/ui/renderers/inputs/text-inputs.ts` -> `OnUserInput`)。

## 実装箇所

- `crates/nanai-core/src/shiori_protocol_helpers/events/input.rs:156` `pub fn build_on_user_input_request`
- `ui/ts/core/actions/dictation.ts:37` `this.app.ghostController.sendShioriEvent("OnUserInput", [text]);`
- `ui/ts/ghost/command-handler/inputbox.ts:91` `handler.app.ghostController?.sendShioriEvent("OnUserInput", [`
- `ui/ts/ui/renderers/inputs/text-inputs.ts:79` `await this.app.ghostController?.sendShioriEvent("OnUserInput", [`
- `ui/ts/ui/renderers/inputs/advanced/date-time-inputs.ts:115` `await this.app.ghostController?.sendShioriEvent("OnUserInput", [`
