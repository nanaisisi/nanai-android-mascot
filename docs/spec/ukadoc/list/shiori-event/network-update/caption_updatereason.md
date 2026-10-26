# ネットワーク更新理由

- **規格**: [caption_updatereason.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/caption_updatereason/) (ukadoc-spec/list/shiori-event/network-update/caption_updatereason/)
- **検索語**: ネットワーク更新理由
- **対応状況**: ⚠️ 一部対応

## 突合結果

OnUpdateProcessExec / OnUpdateBegin / OnUpdateReady / OnUpdateComplete / OnUpdateFailure / OnUpdateCheck* の Reference4 に更新理由 "manual" を使用している (メニューからの実行)。auto / script は未使用。

## 実装箇所

- `ui/js/core/app-update.js` (各 sendShioriEvent の第5引数 `"" "ghost", "manual"`)
- `ui/js/core/app-update.js` `await gc.sendShioriEvent("OnUpdateProcessExec", ["manual"])`
