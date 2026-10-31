# OnUserInputCancel

- **規格**: [OnUserInputCancel.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/inputbox/OnUserInputCancel/) (ukadoc-spec/list/shiori-event/inputbox/OnUserInputCancel.md)
- **検索語**: OnUserInputCancel
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/js/ghost/sakura-command-handler.js:191` `await this.app.ghostController.sendShioriEvent("OnUserInputCancel", [id]);`
- `ui/js/ghost/sakura-command-handler.js:217` `this.app.ghostController.sendShioriEvent("OnUserInputCancel", [id]);`
- `ui/js/ghost/sakura-command-handler.js:293` `// Reference0: 空席 (OnUserInputCancel と番号を揃える) / Reference1: cancel`
