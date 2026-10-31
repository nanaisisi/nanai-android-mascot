# OnUserInputCancel

- **規格**: [OnUserInputCancel.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/inputbox/OnUserInputCancel/) (ukadoc-spec/list/shiori-event/inputbox/OnUserInputCancel.md)
- **検索語**: OnUserInputCancel
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/js/ghost/command-handler/inputbox.js:73` `await handler.app.ghostController.sendShioriEvent("OnUserInputCancel", [id]);`
- `ui/js/ghost/command-handler/inputbox.js:99` `handler.app.ghostController.sendShioriEvent("OnUserInputCancel", [id]);`
