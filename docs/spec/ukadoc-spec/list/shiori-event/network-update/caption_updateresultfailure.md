# ネットワーク失敗理由

- **規格**: [caption_updateresultfailure.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/caption_updateresultfailure/) (ukadoc-spec/list/shiori-event/network-update/caption_updateresultfailure/)
- **検索語**: ネットワーク失敗理由
- **対応状況**: ⚠️ 一部対応

## 突合結果

OnUpdateFailure / OnUpdateCheckFailure の Reference0 に失敗理由として timeout / 404 (ステータスコード) / "md5 miss" / fileio を使用している。SSP固有の artificial (ユーザ中断) / readonly 等は未使用。

## 実装箇所

- `ui/js/core/app-update.js` (catch 節の reason 判定: 404 / timeout / fileio)
- `src-tauri/src/commands/update/network.rs` (`reason: "md5 miss"`, `reason: "fileio"`, ステータスコード, timeout 判定)
