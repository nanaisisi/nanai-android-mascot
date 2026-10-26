# OnAnchorSelect

- **規格**: [OnAnchorSelect.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/choice/OnAnchorSelect/) (ukadoc-spec/list/shiori-event/choice/OnAnchorSelect.md)
- **検索語**: OnAnchorSelect
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/js/ghost/sakura-script.js:37`  `this.app.ghostController.sendShioriEvent("OnAnchorSelect", [anchorId]);`
- `ui/js/ghost/sakura-script.js:189`  `this.app.ghostController.sendShioriEvent("OnAnchorSelect", [`
