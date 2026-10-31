# OnAnchorSelect

- **規格**: [OnAnchorSelect.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/choice/OnAnchorSelect/) (ukadoc-spec/list/shiori-event/choice/OnAnchorSelect.md)
- **検索語**: OnAnchorSelect
- **対応状況**: ✅ 実装済

## 突合結果

OnAnchorSelect 選択肢/アンカー関連SHIORIイベント処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify, crates/ui/src/script/command.rs).

## 実装箇所

- `ui/js/ghost/sakura-script.js:43` `this.app.ghostController.sendShioriEvent("OnAnchorSelect", [`
- `ui/js/ghost/shiori-notify.js:23` `* - OnAnchorEnter, OnAnchorHover, OnAnchorSelect, OnAnchorSelectEx`
- `ui/js/ghost/sakura-play/handlers.js:115` `app.ghostController.sendShioriEvent("OnAnchorSelect", [`
