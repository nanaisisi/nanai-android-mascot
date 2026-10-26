# OnBIFFComplete

- **規格**: [OnBIFFComplete.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/biff/OnBIFFComplete/) (ukadoc-spec/list/shiori-event/biff/OnBIFFComplete.md)
- **検索語**: OnBIFFComplete
- **対応状況**: ⚠️ 一部対応(リクエスト生成のみ)

## 突合結果

src-tauri/src/shiori/ffi.rs にリクエスト生成関数はあるが、発火元の呼び出しは未確認。

## 実装箇所

- `src-tauri/src/shiori/ffi.rs:271` (コメント) `/// OnBIFFCompleteイベントのリクエストを作成 (メールチェック完了)`
- `src-tauri/src/shiori/ffi.rs:275` `.header("Event", "OnBIFFComplete")`
