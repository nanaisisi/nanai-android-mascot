# OnUpdate.OnDownloadBegin

- **規格**: [OnUpdate.OnDownloadBegin.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdate.OnDownloadBegin/) (ukadoc-spec/list/shiori-event/network-update/OnUpdate.OnDownloadBegin/)
- **検索語**: OnUpdate.OnDownloadBegin
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

Rust 側の 1ファイルごとのダウンロード開始通知 (`update-progress` / phase `download-begin`) をフロントエンドで受信し、SHIORI へイベントを送信している。

## 実装箇所

- `src-tauri/src/commands/update/network.rs` (`report_progress(&app_handle, "download-begin", &entry.path, None)`)
- `ui/js/core/app-update.js` (コメント) `*    - OnUpdate.OnDownloadBegin`
- `ui/js/core/app-update.js` `gc.sendShioriEvent("OnUpdate.OnDownloadBegin", [filePath, "", "", "ghost", "manual"])`
