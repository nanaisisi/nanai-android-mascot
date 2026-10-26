# OnUpdateBegin

- **規格**: [OnUpdateBegin.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/network-update/OnUpdateBegin/) (ukadoc-spec/list/shiori-event/network-update/OnUpdateBegin.md)
- **検索語**: OnUpdateBegin
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「OnUpdateBegin」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/core/app-update.js:7` (コメント) `* 2. OnUpdateBegin`
- `ui/js/core/app-update.js:38` (コメント) `// 2. OnUpdateBegin 送信 (Ref0: ゴースト名, Ref1: パス, Ref3: "ghost", Ref4: "manual")`
- `ui/js/core/app-update.js:39`  `await gc.sendShioriEvent("OnUpdateBegin", [ghostName, ghostPath, "", "ghost", "manual"]);`
