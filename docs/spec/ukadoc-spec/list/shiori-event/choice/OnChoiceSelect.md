# OnChoiceSelect

- **規格**: [OnChoiceSelect.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/choice/OnChoiceSelect/) (ukadoc-spec/list/shiori-event/choice/OnChoiceSelect.md)
- **検索語**: OnChoiceSelect
- **対応状況**: ✅ 実装済

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/js/ghost/sakura-script.js:124` `await this.app.ghostController.sendShioriEvent("OnChoiceSelect", [`
- `ui/js/core/app-actions.js:16` `recommend: ["OnChoiceSelect", ["recommendlink"]],`
- `ui/js/core/app-actions.js:17` `portal: ["OnChoiceSelect", ["portal"]],`
