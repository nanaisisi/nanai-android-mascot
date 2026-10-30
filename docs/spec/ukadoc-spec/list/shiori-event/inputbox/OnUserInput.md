# OnUserInput

- **規格**: [OnUserInput.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/inputbox/OnUserInput/) (ukadoc-spec/list/shiori-event/inputbox/OnUserInput.md)
- **検索語**: OnUserInput
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/js/ghost/sakura-command-handler.js:138` `await this.app.ghostController.sendShioriEvent("OnUserInput", [`
- `ui/js/ghost/sakura-command-handler.js:147` `await this.app.ghostController.sendShioriEvent("OnUserInputCancel", [id]);`
- `ui/js/ghost/sakura-command-handler.js:173` `this.app.ghostController.sendShioriEvent("OnUserInputCancel", [id]);`
- `ui/js/ghost/sakura-command-handler.js:249` `// Reference0: 空席 (OnUserInputCancel と番号を揃える) / Reference1: cancel`
- `tests/sakura-command-handler.test.js:125` `assert.ok(eventsSent.some((e) => e.ev === "OnUserInput"));`
