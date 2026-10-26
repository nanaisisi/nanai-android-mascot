# OnBIFFComplete

- **規格**: [OnBIFFComplete.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/biff/OnBIFFComplete/) (ukadoc-spec/list/shiori-event/biff/OnBIFFComplete.md)
- **検索語**: OnBIFFComplete
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「OnBIFFComplete」が出現。実際の処理内容は未精査。

## 実装箇所

- `src-tauri/src/shiori/ffi.rs:271` (コメント) `/// OnBIFFCompleteイベントのリクエストを作成 (メールチェック完了)`
- `src-tauri/src/shiori/ffi.rs:275`  `.header("Event", "OnBIFFComplete")`
