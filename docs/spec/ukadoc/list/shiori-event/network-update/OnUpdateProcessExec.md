# OnUpdateProcessExec

- **規格**: [OnUpdateProcessExec.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateProcessExec/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateProcessExec.md)
- **検索語**: OnUpdateProcessExec
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「OnUpdateProcessExec」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/core/app-update.js:6` (コメント) `* 1. OnUpdateProcessExec (スクリプト返答があればカスタマイズ)`
- `ui/js/core/app-update.js:31` (コメント) `// 1. OnUpdateProcessExec 送信`
- `ui/js/core/app-update.js:32`  `const execRes = await gc.sendShioriEvent("OnUpdateProcessExec", ["manual"]);`
- `ui/js/core/app-update.js:34`  `console.log("OnUpdateProcessExec でスクリプトが返されたため標準処理を委譲");`
