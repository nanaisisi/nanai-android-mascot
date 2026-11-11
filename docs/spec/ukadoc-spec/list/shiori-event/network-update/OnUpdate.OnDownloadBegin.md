# OnUpdate.OnDownloadBegin

- **規格**: [OnUpdate.OnDownloadBegin.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdate.OnDownloadBegin/) (ukadoc-spec/list/shiori-event/network-update/OnUpdate.OnDownloadBegin/)
- **検索語**: OnUpdate.OnDownloadBegin
- **対応状況**: ✅ 実装済

## 突合結果

Rust 側の 1ファイルごとのダウンロード開始通知 (`update-progress` / phase `download-begin`) をフロントエンドで受信し、SHIORI へイベントを送信している。

## 実装箇所

- `src-tauri/src/commands/update/network/helpers.rs:51` `/// (フロント側で OnUpdate.OnDownloadBegin / OnUpdate.OnMD5Compare* として SHIORI に中継する)`
- `crates/nanai-core/src/update_protocol.rs:28` `"OnUpdate.OnDownloadBegin",`
- `ui/ts/core/actions/update-protocol.ts:7` `* - OnUpdate.OnDownloadBegin / OnUpdate.OnMD5CompareBegin / OnUpdate.OnMD5Compar`
- `ui/ts/core/actions/update-protocol.ts:90` `"OnUpdate.OnDownloadBegin",`
- `ui/ts/core/actions/update-protocol.ts:199` `"download-begin": "OnUpdate.OnDownloadBegin",`
