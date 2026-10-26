# OnUpdateComplete

- **規格**: [OnUpdateComplete.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateComplete/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateComplete.md)
- **検索語**: OnUpdateComplete
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「OnUpdateComplete」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/core/app-update.js:9` (コメント) `*    - 更新なし: OnUpdateComplete (Reference0: "none")`
- `ui/js/core/app-update.js:15` (コメント) `* 5. 全ファイル取得・置き換え後、ゴースト再ロード -> OnUpdateComplete (Reference0: "changed")`
- `ui/js/core/app-update.js:59`  `await gc.sendShioriEvent("OnUpdateComplete", ["none", "", "", "ghost", "manual"]);`
- `ui/js/core/app-update.js:80`  `await gc.sendShioriEvent("OnUpdateComplete", [updateResult.reason || "changed", updatedFil`
