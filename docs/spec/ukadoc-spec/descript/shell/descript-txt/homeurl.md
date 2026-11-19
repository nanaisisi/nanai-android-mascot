# homeurl,URL

- **規格**: [homeurl.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/homeurl/) (ukadoc-spec/descript/shell/descript-txt/homeurl.md)
- **検索語**: homeurl
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/shell.rs` および `crates/nanai-core/src/descript_parser/types.rs` においてシェル `descript.txt` の `homeurl` キーのパースおよびネットワーク更新基点 URL バインド処理が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs` (`home_url`)
- `src-tauri/src/ghost/scan/shell.rs` (`homeurl`)
