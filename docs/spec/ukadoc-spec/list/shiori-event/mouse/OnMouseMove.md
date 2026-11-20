# OnMouseMove

- **規格**: [OnMouseMove.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/mouse/OnMouseMove/) (ukadoc-spec/list/shiori-event/mouse/OnMouseMove.md)
- **検索語**: OnMouseMove
- **対応状況**: ✅ 実装済

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/ts/core/events/mouse/click.ts:130` `return dispatchShioriMouseEvent(app, "OnMouseMove", [`
- `tests/core-coverage-boost/app-events-coverage.test.ts:993` `{ evt: "OnMouseMove", args: [10, 20, 0, 0, "Head"] },`
