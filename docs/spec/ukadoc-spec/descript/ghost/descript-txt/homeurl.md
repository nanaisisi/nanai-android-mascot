# homeurl,URL

- **規格**: [homeurl.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/homeurl.md)
- **検索語**: homeurl
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/commands/update/dau.rs` および `crates/nanai-core/src/descript_parser/types.rs` (`homeurl()`) において、ネットワーク更新基点URL `homeurl` キーのパース・参照および取得が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs` (`homeurl`)
- `src-tauri/src/commands/update/dau.rs` (`homeurl`)
- `src-tauri/src/commands/ext.rs` (`homeurl`)
