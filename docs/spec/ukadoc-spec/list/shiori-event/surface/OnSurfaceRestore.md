# OnSurfaceRestore

- **規格**: [OnSurfaceRestore.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/surface/OnSurfaceRestore/) (ukadoc-spec/list/shiori-event/surface/OnSurfaceRestore.md)
- **検索語**: OnSurfaceRestore
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/js/ghost/sakura-script.js:262` (コメント) `* 発話終了後のサーフィス自動復帰タイマー (OnSurfaceRestore)`
- `ui/js/ghost/sakura-script.js:271` `await this.app.ghostController.sendShioriEvent("OnSurfaceRestore");`
