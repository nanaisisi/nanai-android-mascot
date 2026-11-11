# OnUserInputCancel

- **規格**: [OnUserInputCancel.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/inputbox/OnUserInputCancel/) (ukadoc-spec/list/shiori-event/inputbox/OnUserInputCancel.md)
- **検索語**: OnUserInputCancel
- **対応状況**: ✅ 実装済

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/ts/ui/renderers/inputs/text-inputs.ts:90` `await this.app.ghostController?.sendShioriEvent("OnUserInputCancel", [`
- `ui/ts/ui/renderers/inputs/advanced/date-time-inputs.ts:126` `await this.app.ghostController?.sendShioriEvent("OnUserInputCancel", [`
- `ui/ts/ui/renderers/inputs/advanced/date-time-inputs.ts:291` `await this.app.ghostController?.sendShioriEvent("OnUserInputCancel", [`
- `ui/ts/ui/renderers/inputs/advanced/ip-input.ts:137` `await this.app.ghostController?.sendShioriEvent("OnUserInputCancel", [`
- `ui/ts/ui/renderers/inputs/advanced/slider-input.ts:114` `await this.app.ghostController?.sendShioriEvent("OnUserInputCancel", [`
