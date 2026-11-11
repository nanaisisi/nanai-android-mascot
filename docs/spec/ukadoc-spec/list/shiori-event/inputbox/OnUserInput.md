# OnUserInput

- **規格**: [OnUserInput.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/inputbox/OnUserInput/) (ukadoc-spec/list/shiori-event/inputbox/OnUserInput.md)
- **検索語**: OnUserInput
- **対応状況**: ✅ 実装済

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/ts/core/actions/dictation.ts:37` `this.app.ghostController.sendShioriEvent("OnUserInput", [text]);`
- `ui/ts/ghost/command-handler/inputbox.ts:91` `handler.app.ghostController?.sendShioriEvent("OnUserInput", [`
- `ui/ts/ui/renderers/inputs/text-inputs.ts:79` `await this.app.ghostController?.sendShioriEvent("OnUserInput", [`
- `ui/ts/ui/renderers/inputs/advanced/date-time-inputs.ts:115` `await this.app.ghostController?.sendShioriEvent("OnUserInput", [`
- `ui/ts/ui/renderers/inputs/advanced/date-time-inputs.ts:280` `await this.app.ghostController?.sendShioriEvent("OnUserInput", [`
