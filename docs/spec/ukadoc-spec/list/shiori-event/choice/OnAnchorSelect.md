# OnAnchorSelect

- **規格**: [OnAnchorSelect.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/choice/OnAnchorSelect/) (ukadoc-spec/list/shiori-event/choice/OnAnchorSelect.md)
- **検索語**: OnAnchorSelect
- **対応状況**: ⚠️ 一部対応

## 突合結果

OnAnchorSelect 選択肢/アンカー関連SHIORIイベント処理を実装 (ui/js/ghost/shiori-notify.js -> sendShioriNotify, crates/ui/src/script/command.rs).

## 実装箇所

- `ui/ts/ghost/sakura-script.ts:607` `void app.ghostController.sendShioriEvent("OnAnchorSelect", [`
- `ui/ts/ghost/shiori-protocol.ts:153` `ANCHOR_SELECT: "OnAnchorSelect",`
