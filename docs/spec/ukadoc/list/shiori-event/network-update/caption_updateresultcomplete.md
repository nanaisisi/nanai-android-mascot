# ネットワーク更新成功理由

- **規格**: [caption_updateresultcomplete.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/caption_updateresultcomplete/) (ukadoc-spec/list/shiori-event/network-update/caption_updateresultcomplete/)
- **検索語**: ネットワーク更新成功理由
- **対応状況**: ✅ 実装済(選択肢全対応)

## 突合結果

OnUpdateComplete / OnUpdateCheckComplete の Reference0 に成功理由として "none" (更新ファイルなし) と "changed" (更新実行後) の両方を使用している。

## 実装箇所

- `ui/js/core/app-update.js` `await gc.sendShioriEvent("OnUpdateComplete", ["none", ...])`
- `ui/js/core/app-update.js` `updateResult.reason || "changed"` (network.rs の成功時 reason = "changed")
- `ui/js/core/app-update.js` `checkResult.has_update ? String(checkResult.total_count) : "none"` (チェックのみ)
