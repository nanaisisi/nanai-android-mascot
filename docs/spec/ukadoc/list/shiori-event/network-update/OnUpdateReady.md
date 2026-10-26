# OnUpdateReady

- **規格**: [OnUpdateReady.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateReady/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateReady.md)
- **検索語**: OnUpdateReady
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/js/core/app-update.js:10` (コメント) `*    - 更新あり: OnUpdateReady (Reference0: ファイル総数-1, Reference1: ファイル名リスト)`
- `ui/js/core/app-update.js:63` (コメント) `// 4. OnUpdateReady`
- `ui/js/core/app-update.js:66`  `await gc.sendShioriEvent("OnUpdateReady", [totalMinusOne, fileListStr, "", "ghost", "manua`
