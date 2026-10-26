# OnBIFFBegin

- **規格**: [OnBIFFBegin.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/biff/OnBIFFBegin/) (ukadoc-spec/list/shiori-event/biff/OnBIFFBegin.md)
- **検索語**: OnBIFFBegin
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「OnBIFFBegin」が出現。実際の処理内容は未精査。

## 実装箇所

- `src-tauri/src/shiori/ffi.rs:263` (コメント) `/// OnBIFFBeginイベントのリクエストを作成 (メールチェック開始)`
- `src-tauri/src/shiori/ffi.rs:267`  `.header("Event", "OnBIFFBegin")`
