# OnUserInputCancel

- **規格**: [OnUserInputCancel.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/inputbox/OnUserInputCancel/) (ukadoc-spec/list/shiori-event/inputbox/OnUserInputCancel.md)
- **検索語**: OnUserInputCancel
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「OnUserInputCancel」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/ghost/sakura-command-handler.js:119`  `await this.app.ghostController.sendShioriEvent("OnUserInputCancel", [id]);`
- `ui/js/ghost/sakura-command-handler.js:145`  `this.app.ghostController.sendShioriEvent("OnUserInputCancel", [id]);`
