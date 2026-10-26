# OnUpdate.OnMD5CompareComplete

- **規格**: [OnUpdate.OnMD5CompareComplete.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdate.OnMD5CompareComplete/) (ukadoc-spec/list/shiori-event/network-update/OnUpdate.OnMD5CompareComplete/)
- **検索語**: OnUpdate.OnMD5CompareComplete
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

Rust 側の MD5 照合成功通知 (`update-progress` / phase `md5-complete`) をフロントエンドで受信し、SHIORI へイベントを送信している。

## 実装箇所

- `src-tauri/src/commands/update/network.rs` (`report_progress(&app_handle, "md5-complete", &entry.path, None)`)
- `ui/js/core/app-update.js` `gc.sendShioriEvent("OnUpdate.OnMD5CompareComplete", [filePath, "", "", "ghost", "manual"])`
