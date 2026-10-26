# OnWindowStateRestore

- **規格**: [OnWindowStateRestore.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnWindowStateRestore/) (ukadoc-spec/list/shiori-event/boot-close-change/OnWindowStateRestore.md)
- **検索語**: OnWindowStateRestore
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「OnWindowStateRestore」が出現。実際の処理内容は未精査。

## 実装箇所

- `ui/js/core/app-settings.js:62`  `this.ghostController.sendShioriEvent("OnWindowStateRestore");`
- `src-tauri/src/shiori/ffi.rs:255` (コメント) `/// OnWindowStateRestoreイベントのリクエストを作成`
- `src-tauri/src/shiori/ffi.rs:259`  `.header("Event", "OnWindowStateRestore")`
