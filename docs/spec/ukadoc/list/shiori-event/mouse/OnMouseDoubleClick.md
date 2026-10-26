# OnMouseDoubleClick

- **規格**: [OnMouseDoubleClick.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/mouse/OnMouseDoubleClick/) (ukadoc-spec/list/shiori-event/mouse/OnMouseDoubleClick.md)
- **検索語**: OnMouseDoubleClick
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「OnMouseDoubleClick」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/core/app-events.js:134` (コメント) `// まず OnMouseDoubleClick (つつき) を送信 (多くのゴーストがつつきトークを定義)`
- `ui/js/core/app-events.js:135`  `this.ghostController.sendShioriEvent("OnMouseDoubleClick", args).then((res) => {`
