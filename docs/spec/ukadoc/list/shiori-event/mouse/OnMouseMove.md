# OnMouseMove

- **規格**: [OnMouseMove.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/mouse/OnMouseMove/) (ukadoc-spec/list/shiori-event/mouse/OnMouseMove.md)
- **検索語**: OnMouseMove
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/js/core/app-events.js:147`  `this.ghostController.sendShioriEvent("OnMouseMove", [col.canvasX, col.canvasY, 0, scopeId,`
