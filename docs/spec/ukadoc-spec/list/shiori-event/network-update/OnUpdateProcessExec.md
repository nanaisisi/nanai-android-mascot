# OnUpdateProcessExec

- **規格**: [OnUpdateProcessExec.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateProcessExec/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateProcessExec.md)
- **検索語**: OnUpdateProcessExec
- **対応状況**: ✅ 実装済(SHIORIへ送信)

## 突合結果

UI/Rust 側から sendShioriEvent 等でイベントを送信している(実装箇所を参照)。

## 実装箇所

- `ui/js/core/app-update.js:11` `* 1. OnUpdateProcessExec (スクリプト返答があればカスタマイズ)`
- `ui/js/core/app-update.js:43` `// 1. OnUpdateProcessExec 送信`
- `ui/js/core/app-update.js:44` `const execRes = await gc.sendShioriEvent("OnUpdateProcessExec", ["manual"]);`
- `ui/js/core/app-update.js:47` `"OnUpdateProcessExec でスクリプトが返されたため標準処理を委譲",`
- `tests/app-update.test.js:62` `if (ev === "OnUpdateProcessExec") return { script: scriptReturn };`
