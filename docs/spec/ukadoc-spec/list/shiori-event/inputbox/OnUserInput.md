# OnUserInput

- **規格**: [OnUserInput.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/inputbox/OnUserInput/) (ukadoc-spec/list/shiori-event/inputbox/OnUserInput.md)
- **検索語**: OnUserInput
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/js/core/actions/dictation.js:31` `this.app.ghostController.sendShioriEvent("OnUserInput", [text]);`
- `ui/js/ghost/command-handler/inputbox.js:64` `await handler.app.ghostController.sendShioriEvent("OnUserInput", [`
- `ui/js/ghost/command-handler/inputbox.js:73` `await handler.app.ghostController.sendShioriEvent("OnUserInputCancel", [id]);`
- `ui/js/ghost/command-handler/inputbox.js:99` `handler.app.ghostController.sendShioriEvent("OnUserInputCancel", [id]);`
- `tests/sakura-command-handler.test.js:125` `assert.ok(eventsSent.some((e) => e.ev === "OnUserInput"));`
