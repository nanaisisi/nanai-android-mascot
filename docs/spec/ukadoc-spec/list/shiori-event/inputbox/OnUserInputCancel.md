# OnUserInputCancel

- **規格**: [OnUserInputCancel.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/inputbox/OnUserInputCancel/) (ukadoc-spec/list/shiori-event/inputbox/OnUserInputCancel.md)
- **検索語**: OnUserInputCancel
- **対応状況**: ✅ 実装済

## 突合結果

単一行入力ボックス/拡張入力ボックスのキャンセル時に `OnUserInputCancel` SHIORIイベントを送信する処理を実装 (`ui/ts/ui/renderers/inputs/text-inputs.ts` -> `OnUserInputCancel`)。

## 実装箇所

- `crates/nanai-core/src/shiori_protocol_helpers/events/input.rs:178` `pub fn build_on_user_input_cancel_request`
- `ui/ts/ui/renderers/inputs/text-inputs.ts:90` `await this.app.ghostController?.sendShioriEvent("OnUserInputCancel", [`
- `ui/ts/ui/renderers/inputs/advanced/date-time-inputs.ts:126` `await this.app.ghostController?.sendShioriEvent("OnUserInputCancel", [`
- `ui/ts/ui/renderers/inputs/advanced/ip-input.ts:137` `await this.app.ghostController?.sendShioriEvent("OnUserInputCancel", [`
- `ui/ts/ui/renderers/inputs/advanced/slider-input.ts:114` `await this.app.ghostController?.sendShioriEvent("OnUserInputCancel", [`
