# OnChoiceSelect(Ex)/OnAnchorSelect(Ex)/\q等に指定された任意名イベント

- **規格**: [OnChoiceSelect-Ex-OnAnchorSelect-Ex-q.md](https://ukatech.shillest.net/ukadoc-spec/list/plugin-event/plugin-event/OnChoiceSelect-Ex-OnAnchorSelect-Ex-q/) (ukadoc-spec/list/plugin-event/plugin-event/OnChoiceSelect-Ex-OnAnchorSelect-Ex-q.md)
- **検索語**: OnChoiceSelect
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「OnChoiceSelect」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/ghost/sakura-script.js:297`  `await this.app.ghostController.sendShioriEvent("OnChoiceSelect", [`
- `ui/js/core/app-actions.js:23`  `recommend: ["OnChoiceSelect", ["recommendlink"]],`
- `ui/js/core/app-actions.js:24`  `portal: ["OnChoiceSelect", ["portal"]],`
