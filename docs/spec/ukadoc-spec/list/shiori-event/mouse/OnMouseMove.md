# OnMouseMove

- **規格**: [OnMouseMove.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/mouse/OnMouseMove/) (ukadoc-spec/list/shiori-event/mouse/OnMouseMove.md)
- **検索語**: OnMouseMove
- **対応状況**: ⚠️ 一部対応

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/ts/core/events/mouse.ts:68` `(this as unknown).ghostController.sendShioriEvent("OnMouseMove", [`
