# update-file : フィールド詳細

- **規格**: [fields.md](https://ukatech.shillest.net/ukadoc-spec/spec/update-file/fields/) (ukadoc-spec/spec/update-file/fields.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/commands/update/dau.rs` および UI 側の `parse_update_definition` にて相対パス、MD5、ファイルサイズ、文字コード等のフィールドパース処理を完備。


## 実装箇所

- `crates/ui/src/shiori/protocol/request/parser.rs:11` `let mut fields = first.split_whitespace();`
- `crates/ui/src/shiori/protocol/request/parser.rs:12` `let method = fields.next().ok_or_else(|| "empty request".to_string())?;`
- `crates/ui/src/shiori/protocol/request/parser.rs:13` `let version = fields`
