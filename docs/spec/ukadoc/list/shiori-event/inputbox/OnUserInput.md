# OnUserInput

- **規格**: [OnUserInput.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/inputbox/OnUserInput/) (ukadoc-spec/list/shiori-event/inputbox/OnUserInput.md)
- **検索語**: OnUserInput
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「OnUserInput」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/ghost/sakura-command-handler.js:113`  `await this.app.ghostController.sendShioriEvent("OnUserInput", [id, val]);`
- `ui/js/ghost/sakura-command-handler.js:119`  `await this.app.ghostController.sendShioriEvent("OnUserInputCancel", [id]);`
- `ui/js/ghost/sakura-command-handler.js:145`  `this.app.ghostController.sendShioriEvent("OnUserInputCancel", [id]);`
