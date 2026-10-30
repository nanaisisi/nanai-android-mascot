# OnUpdateBegin

- **規格**: [OnUpdateBegin.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateBegin/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateBegin.md)
- **検索語**: OnUpdateBegin
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/js/core/app-update.js:12` `* 2. OnUpdateBegin`
- `ui/js/core/app-update.js:52` `// 2. OnUpdateBegin 送信 (Ref0: ゴースト名, Ref1: パス, Ref3: "ghost", Ref4: "manual")`
- `ui/js/core/app-update.js:55` `"OnUpdateBegin",`
