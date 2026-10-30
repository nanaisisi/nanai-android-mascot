# OnUpdate.OnMD5CompareBegin

- **規格**: [OnUpdate.OnMD5CompareBegin.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdate.OnMD5CompareBegin/) (ukadoc-spec/list/shiori-event/network-update/OnUpdate.OnMD5CompareBegin/)
- **検索語**: OnUpdate.OnMD5CompareBegin
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

Rust 側の MD5 照合開始通知 (`update-progress` / phase `md5-begin`) をフロントエンドで受信し、SHIORI へイベントを送信している。

## 実装箇所

- `ui/js/core/app-update.js:19` `*    - OnUpdate.OnMD5CompareBegin`
- `ui/js/core/actions/update-protocol.js:20` `"md5-begin": "OnUpdate.OnMD5CompareBegin",`
