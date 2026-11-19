# homeurl,URL

- **規格**: [homeurl.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/homeurl.md)
- **検索語**: homeurl
- **対応状況**: ✅ 実装済

## 突合結果

`homeurl`（ホームページURL）のパースおよび取得メソッド (`homeurl()`) が Rust コアおよびアップデート処理 (`dau.rs`) で完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs` (`homeurl`)
- `src-tauri/src/commands/update/dau.rs` (`homeurl`)
