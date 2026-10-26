# OnMouseDoubleClick

- **規格**: [OnMouseDoubleClick.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/mouse/OnMouseDoubleClick/) (ukadoc-spec/list/shiori-event/mouse/OnMouseDoubleClick.md)
- **検索語**: OnMouseDoubleClick
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/js/core/app-events.js:134` (コメント) `// まず OnMouseDoubleClick (つつき) を送信 (多くのゴーストがつつきトークを定義)`
- `ui/js/core/app-events.js:135`  `this.ghostController.sendShioriEvent("OnMouseDoubleClick", args).then((res) => {`
