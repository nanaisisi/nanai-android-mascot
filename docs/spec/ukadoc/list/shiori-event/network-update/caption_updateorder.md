# ネットワーク更新イベントの発生順序

- **規格**: [caption_updateorder.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/caption_updateorder/) (ukadoc-spec/list/shiori-event/network-update/caption_updateorder/)
- **検索語**: ネットワーク更新イベントの発生順序
- **対応状況**: ⚠️ 一部対応

## 突合結果

ゴースト本体更新の標準的な発生順序 (OnUpdateProcessExec → OnUpdateBegin → OnUpdateReady → 各ファイルの OnUpdate.OnDownloadBegin / OnUpdate.OnMD5CompareBegin / OnUpdate.OnMD5CompareComplete|Failure → OnUpdateComplete、チェックのみ実行時は OnUpdateCheckComplete / OnUpdateCheckFailure) を app-update.js のコメントおよび実装で準拠している。スクリプト返答による再生完了待ちや途中失敗時のリトライ再取得など一部の仕様は未実装。

## 実装箇所

- `ui/js/core/app-update.js` (モジュール先頭コメントに発生順序を記述)
- `src-tauri/src/commands/update/network.rs` (1ファイル単位の進捗通知経由で per-file イベントを発生)
