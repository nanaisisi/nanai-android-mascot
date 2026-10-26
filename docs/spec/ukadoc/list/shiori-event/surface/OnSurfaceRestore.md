# OnSurfaceRestore

- **規格**: [OnSurfaceRestore.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/surface/OnSurfaceRestore/) (ukadoc-spec/list/shiori-event/surface/OnSurfaceRestore.md)
- **検索語**: OnSurfaceRestore
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「OnSurfaceRestore」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/ghost/sakura-script.js:262` (コメント) `* 発話終了後のサーフィス自動復帰タイマー (OnSurfaceRestore)`
- `ui/js/ghost/sakura-script.js:271`  `await this.app.ghostController.sendShioriEvent("OnSurfaceRestore");`
