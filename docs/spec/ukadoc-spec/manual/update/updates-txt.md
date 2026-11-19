# updates.txt

- **規格**: [update.md](../../../../ukadoc-spec/manual/update.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/update/))
- **検索語**: updates.txt, parse_update_definition
- **対応状況**: ✅ 実装済

## 突合結果

`updates2.dau` の代替形式である `updates.txt`（`charset,` 行と `file,<path>,<md5>,...` カンマ区切り形式）の取得フォールバックおよびパース・MD5 検証を実装している。`src-tauri/src/commands/update/network/commands/check.rs:60-69` が `updates2.dau` 取得失敗時に `homeurl` + `updates.txt` を試行し、Shift_JIS デコードのうえ `parse_update_definition`（`crates/ui/src/update/parser/update_definition.rs:14-28`）で `file,` 接頭辞・`charset,` 行スキップ・カンマ区切り・オプションフラグを解析する（テスト: `crates/ui/src/update/tests/definition_package/updates_parser.rs:29`）。生成コマンド `generate_updates2_dau`（`src-tauri/src/commands/update/generation.rs:45`）は走査時の自己除外のみ行い、`updates.txt` の自動出力は `updates2.dau` 専用となっている。

## 実装箇所

- `crates/ui/src/update/parser/update_definition.rs:6` `pub fn parse_update_definition(content: &str) -> Vec<UpdateEntry> {`
- `crates/ui/src/update/parser/update_definition.rs:15` `let data_part = if let Some(stripped) = trimmed.strip_prefix("file,") {`
- `src-tauri/src/commands/update/network/commands/check.rs:61` `let url_txt = format!("{}updates.txt", homeurl);`
- `src-tauri/src/commands/update/generation.rs:45` `|| file_name == "updates.txt"`
- `crates/ui/src/update/tests/definition_package/updates_parser.rs:29` `fn test_parse_updates_txt_comma_delimited() {`
