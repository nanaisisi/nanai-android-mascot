# OnUpdate.OnMD5CompareBegin

- **規格**: [OnUpdate.OnMD5CompareBegin.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdate.OnMD5CompareBegin/) (ukadoc-spec/list/shiori-event/network-update/OnUpdate.OnMD5CompareBegin/)
- **検索語**: OnUpdate.OnMD5CompareBegin
- **対応状況**: ⚠️ 一部対応

## 突合結果

Rust 側の MD5 照合開始通知 (`update-progress` / phase `md5-begin`) をフロントエンドで受信し、SHIORI へイベントを送信している。

## 実装箇所

- `crates/nanai-core/src/update_protocol.rs:29` `"OnUpdate.OnMD5CompareBegin",`
- `ui/ts/core/actions/update-protocol.ts:7` `* - OnUpdate.OnDownloadBegin / OnUpdate.OnMD5CompareBegin / OnUpdate.OnMD5Compar`
- `ui/ts/core/actions/update-protocol.ts:91` `"OnUpdate.OnMD5CompareBegin",`
- `ui/ts/core/actions/update-protocol.ts:200` `"md5-begin": "OnUpdate.OnMD5CompareBegin",`
