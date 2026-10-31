# OnChoiceSelect

- **規格**: [OnChoiceSelect.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/choice/OnChoiceSelect/) (ukadoc-spec/list/shiori-event/choice/OnChoiceSelect.md)
- **検索語**: OnChoiceSelect
- **対応状況**: ✅ 実装済

## 突合結果

OnChoiceSelect 選択肢/アンカー関連SHIORIイベント処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify, crates/ui/src/script/command.rs).

## 実装箇所

- `ui/js/core/app-actions.js:16` `recommend: ["OnChoiceSelect", ["recommendlink"]],`
- `ui/js/core/app-actions.js:17` `portal: ["OnChoiceSelect", ["portal"]],`
- `ui/js/ghost/sakura-script.js:124` `await this.app.ghostController.sendShioriEvent("OnChoiceSelect", [`
- `ui/js/ghost/shiori-notify.js:24` `* - OnChoiceEnter, OnChoiceHover, OnChoiceSelect, OnChoiceSelectEx, OnChoiceTime`
