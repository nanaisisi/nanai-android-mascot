# OnMouseDoubleClick

- **規格**: [OnMouseDoubleClick.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/mouse/OnMouseDoubleClick/) (ukadoc-spec/list/shiori-event/mouse/OnMouseDoubleClick.md)
- **検索語**: OnMouseDoubleClick
- **対応状況**: ✅ 実装済

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/ts/core/events/mouse.ts:31` `.sendShioriEvent("OnMouseDoubleClick", args)`
- `tests/app-events.test.ts:122` `if (ev === "OnMouseDoubleClick") return shioriDoubleRes;`
