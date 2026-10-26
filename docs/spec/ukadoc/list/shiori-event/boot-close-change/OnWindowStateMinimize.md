# OnWindowStateMinimize

- **規格**: [OnWindowStateMinimize.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnWindowStateMinimize/) (ukadoc-spec/list/shiori-event/boot-close-change/OnWindowStateMinimize.md)
- **検索語**: OnWindowStateMinimize
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「OnWindowStateMinimize」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/core/app-actions.js:118`  `this.ghostController.sendShioriEvent("OnWindowStateMinimize");`
- `src-tauri/src/shiori/ffi.rs:247` (コメント) `/// OnWindowStateMinimizeイベントのリクエストを作成`
- `src-tauri/src/shiori/ffi.rs:251`  `.header("Event", "OnWindowStateMinimize")`
