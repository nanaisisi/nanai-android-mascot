# OnClose

- **規格**: [OnClose.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/boot-close-change/OnClose/) (ukadoc-spec/list/shiori-event/boot-close-change/OnClose.md)
- **検索語**: OnClose
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「OnClose」が出現。実際の処理内容は未精査。

## 実装箇所

- `src-tauri/src/shiori/ffi.rs:212` (コメント) `/// OnCloseイベントのリクエストを作成`
- `src-tauri/src/shiori/ffi.rs:216`  `.header("Event", "OnClose")`
