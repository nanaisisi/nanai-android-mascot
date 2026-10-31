# update-file : フィールド詳細

- **規格**: [fields.md](https://ukatech.shillest.net/ukadoc-spec/spec/update-file/fields/) (ukadoc-spec/spec/update-file/fields.md)
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/commands/update/dau.rs` および UI 側の `parse_update_definition` にて相対パス、MD5、ファイルサイズ、文字コード等のフィールドパース処理を完備。


## 実装箇所

- `crates/ui/src/shiori/protocol/request.rs:58` `let mut fields = first.split_whitespace();`
- `crates/ui/src/shiori/protocol/request.rs:59` `let method = fields.next().ok_or_else(|| "empty request".to_string())?;`
- `crates/ui/src/shiori/protocol/request.rs:60` `let version = fields`
- `crates/ui/src/surfaces/parser/handlers/mod.rs:128` `fn test_apply_animation_fields() {`
- `crates/ui/src/surfaces/parser/handlers/mod.rs:138` `fn test_apply_point_all_fields() {`
