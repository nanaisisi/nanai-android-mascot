# OnUserInput

- **規格**: [OnUserInput.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/inputbox/OnUserInput/) (ukadoc-spec/list/shiori-event/inputbox/OnUserInput.md)
- **検索語**: OnUserInput
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/js/ghost/sakura-command-handler.js:113` `await this.app.ghostController.sendShioriEvent("OnUserInput", [id, val]);`
- `ui/js/ghost/sakura-command-handler.js:119` `await this.app.ghostController.sendShioriEvent("OnUserInputCancel", [id]);`
- `ui/js/ghost/sakura-command-handler.js:145` `this.app.ghostController.sendShioriEvent("OnUserInputCancel", [id]);`
