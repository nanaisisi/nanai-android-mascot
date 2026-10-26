# OnUpdate.OnMD5CompareBegin

- **規格**: [OnUpdate.OnMD5CompareBegin.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdate.OnMD5CompareBegin/) (ukadoc-spec/list/shiori-event/network-update/OnUpdate.OnMD5CompareBegin/)
- **検索語**: OnUpdate.OnMD5CompareBegin
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

Rust 側の MD5 照合開始通知 (`update-progress` / phase `md5-begin`) をフロントエンドで受信し、SHIORI へイベントを送信している。

## 実装箇所

- `src-tauri/src/commands/update/network.rs` (`report_progress(&app_handle, "md5-begin", &entry.path, None)`)
- `ui/js/core/app-update.js` (コメント) `*    - OnUpdate.OnMD5CompareBegin`
- `ui/js/core/app-update.js` `gc.sendShioriEvent("OnUpdate.OnMD5CompareBegin", [filePath, "", "", "ghost", "manual"])`
