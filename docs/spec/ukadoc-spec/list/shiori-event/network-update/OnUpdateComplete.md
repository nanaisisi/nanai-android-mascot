# OnUpdateComplete

- **規格**: [OnUpdateComplete.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateComplete/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateComplete.md)
- **検索語**: OnUpdateComplete
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/js/core/app-update.js:14` `*    - 更新なし: OnUpdateComplete (Reference0: "none")`
- `ui/js/core/app-update.js:21` `* 5. 全ファイル取得・置き換え後、ゴースト再ロード -> OnUpdateComplete (Reference0: "changed")`
- `ui/js/core/app-update.js:106` `await gc.sendShioriEvent("OnUpdateComplete", buildUpdateArgs("none"));`
- `ui/js/core/app-update.js:152` `"OnUpdateComplete",`
