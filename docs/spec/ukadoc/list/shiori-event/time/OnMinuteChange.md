# OnMinuteChange

- **規格**: [OnMinuteChange.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/time/OnMinuteChange/) (ukadoc-spec/list/shiori-event/time/OnMinuteChange.md)
- **検索語**: OnMinuteChange
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「OnMinuteChange」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/core/app-settings.js:72`  `await this.ghostController.sendShioriEvent("OnMinuteChange");`
- `src-tauri/src/shiori/ffi.rs:239` (コメント) `/// OnMinuteChangeイベントのリクエストを作成`
- `src-tauri/src/shiori/ffi.rs:243`  `.header("Event", "OnMinuteChange")`
