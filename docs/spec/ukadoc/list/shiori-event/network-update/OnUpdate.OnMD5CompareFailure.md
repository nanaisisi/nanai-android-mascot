# OnUpdate.OnMD5CompareFailure

- **規格**: [OnUpdate.OnMD5CompareFailure.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdate.OnMD5CompareFailure/) (ukadoc-spec/list/shiori-event/network-update/OnUpdate.OnMD5CompareFailure/)
- **検索語**: OnUpdate.OnMD5CompareFailure
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

Rust 側の MD5 不一致通知 (`update-progress` / phase `md5-failed`) をフロントエンドで受信し、SHIORI へイベントを送信している。(SSP仕様のリトライ再ダウンロードは未実装で、この時点で OnUpdateFailure として終了)

## 実装箇所

- `src-tauri/src/commands/update/network.rs` (`report_progress(&app_handle, "md5-failed", &entry.path, Some("md5 miss"))`)
- `ui/js/core/app-update.js` `gc.sendShioriEvent("OnUpdate.OnMD5CompareFailure", [filePath, "", "", "ghost", "manual"])`
