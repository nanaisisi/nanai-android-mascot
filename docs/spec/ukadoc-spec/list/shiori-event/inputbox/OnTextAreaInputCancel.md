# OnTextAreaInputCancel

- **規格**: [OnTextAreaInputCancel.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/inputbox/OnTextAreaInputCancel/) (ukadoc-spec/list/shiori-event/inputbox/OnTextAreaInputCancel.md)
- **検索語**: OnTextAreaInputCancel
- **対応状況**: ✅ 実装済

## 突合結果

複数行テキストエリア入力ボックスキャンセル時に `OnTextAreaInputCancel` SHIORIイベントを送信する処理を実装 (`ui/ts/ui/renderers/inputs/text-inputs.ts` -> `OnTextAreaInputCancel`)。

## 実装箇所

- `crates/nanai-core/src/shiori_protocol_helpers/events/input.rs:209` `pub fn build_on_text_area_input_cancel_request`
- `ui/ts/ui/renderers/inputs/text-inputs.ts:284` `await this.app?.ghostController?.sendShioriEvent?.("OnTextAreaInputCancel", [`
