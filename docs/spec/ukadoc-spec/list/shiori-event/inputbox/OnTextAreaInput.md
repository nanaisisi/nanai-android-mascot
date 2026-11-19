# OnTextAreaInput

- **規格**: [OnTextAreaInput.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/inputbox/OnTextAreaInput/) (ukadoc-spec/list/shiori-event/inputbox/OnTextAreaInput.md)
- **検索語**: OnTextAreaInput
- **対応状況**: ✅ 実装済

## 突合結果

複数行テキストエリア入力ボックス決定時に `OnTextAreaInput` SHIORIイベントを送信する処理を実装 (`ui/ts/ui/renderers/inputs/text-inputs.ts` -> `OnTextAreaInput`)。

## 実装箇所

- `crates/nanai-core/src/shiori_protocol_helpers/events/input.rs:167` `pub fn build_on_text_area_input_request`
- `ui/ts/ui/renderers/inputs/text-inputs.ts:271` `await this.app?.ghostController?.sendShioriEvent?.("OnTextAreaInput", [`
