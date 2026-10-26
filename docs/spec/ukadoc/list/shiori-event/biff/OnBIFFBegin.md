# OnBIFFBegin

- **規格**: [OnBIFFBegin.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/biff/OnBIFFBegin/) (ukadoc-spec/list/shiori-event/biff/OnBIFFBegin.md)
- **検索語**: OnBIFFBegin
- **対応状況**: ⚠️ 一部対応(リクエスト生成のみ)

## 突合結果

src-tauri/src/shiori/ffi.rs にリクエスト生成関数はあるが、発火元の呼び出しは未確認。

## 実装箇所

- `src-tauri/src/shiori/ffi.rs:263` (コメント) `/// OnBIFFBeginイベントのリクエストを作成 (メールチェック開始)`
- `src-tauri/src/shiori/ffi.rs:267`  `.header("Event", "OnBIFFBegin")`
