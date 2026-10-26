# OnChoiceSelect

- **規格**: [OnChoiceSelect.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/choice/OnChoiceSelect/) (ukadoc-spec/list/shiori-event/choice/OnChoiceSelect.md)
- **検索語**: OnChoiceSelect
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/js/ghost/sakura-script.js:297` `await this.app.ghostController.sendShioriEvent("OnChoiceSelect", [`
- `ui/js/core/app-actions.js:23` `recommend: ["OnChoiceSelect", ["recommendlink"]],`
- `ui/js/core/app-actions.js:24` `portal: ["OnChoiceSelect", ["portal"]],`
