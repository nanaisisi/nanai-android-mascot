# OnSurfaceRestore

- **規格**: [OnSurfaceRestore.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/surface/OnSurfaceRestore/) (ukadoc-spec/list/shiori-event/surface/OnSurfaceRestore.md)
- **検索語**: OnSurfaceRestore
- **対応状況**: ✅ 実装済

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/ts/ghost/sakura-script.ts:93` `await this.app.ghostController.sendShioriEvent("OnSurfaceRestore");`
- `ui/ts/ghost/shiori-protocol.ts:140` `SURFACE_RESTORE: "OnSurfaceRestore",`
- `tests/sakura-script.test.ts:91` `assert.ok(eventsSent.some((e) => e.ev === "OnSurfaceRestore"));`
