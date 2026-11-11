# OnUpdate.OnMD5CompareComplete

- **規格**: [OnUpdate.OnMD5CompareComplete.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdate.OnMD5CompareComplete/) (ukadoc-spec/list/shiori-event/network-update/OnUpdate.OnMD5CompareComplete/)
- **検索語**: OnUpdate.OnMD5CompareComplete
- **対応状況**: ⚠️ 一部対応

## 突合結果

Rust 側の MD5 照合成功通知 (`update-progress` / phase `md5-complete`) をフロントエンドで受信し、SHIORI へイベントを送信している。

## 実装箇所

- `crates/nanai-core/src/update_protocol.rs:30` `"OnUpdate.OnMD5CompareComplete",`
- `ui/ts/core/actions/update-protocol.ts:7` `* - OnUpdate.OnDownloadBegin / OnUpdate.OnMD5CompareBegin / OnUpdate.OnMD5Compar`
- `ui/ts/core/actions/update-protocol.ts:92` `"OnUpdate.OnMD5CompareComplete",`
- `ui/ts/core/actions/update-protocol.ts:201` `"md5-complete": "OnUpdate.OnMD5CompareComplete",`
