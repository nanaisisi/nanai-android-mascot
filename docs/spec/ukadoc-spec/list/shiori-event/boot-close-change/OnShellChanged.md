# OnShellChanged

- **規格**: [OnShellChanged.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnShellChanged/) (ukadoc-spec/list/shiori-event/boot-close-change/OnShellChanged.md)
- **検索語**: OnShellChanged
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/js/ghost/ghost.js:245` `this.sendShioriEvent("OnShellChanged", [shellName]);`
