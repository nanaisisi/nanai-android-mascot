# ghost/master/updates.txt (旧仕様)

- **規格**: [ghost.md](../../../../ukadoc-spec/manual/ghost.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/ghost/))
- **検索語**: updates.txt
- **対応状況**: ✅ 実装済

## 突合結果

`docs/ukadoc-spec/manual/ghost.md` の `updates.txt`（`ghost/master/` 配下に置かれる旧仕様位置）について、`check_ghost_update` はゴーストルート直下（`{homeurl}updates2.dau` / `{homeurl}updates.txt`）を優先して取得し、存在しない場合は旧仕様位置 `{homeurl}ghost/master/updates2.dau` および `{homeurl}ghost/master/updates.txt` へフォールバックする。`parse_update_definition`（`crates/ui`）が `file,` プレフィックスおよび `,` / `\x01` 区切り・各種フラグ（`ignore` / `readonly` / `delete`）を解析する。

## 実装箇所

- `src-tauri/src/commands/update/network/commands/check.rs:61` `let url_txt = format!("{}updates.txt", homeurl);`
- `crates/ui/src/update/parser/update_definition.rs:6` `pub fn parse_update_definition(content: &str) -> Vec<UpdateEntry> {`
- `crates/ui/src/update/parser/update_definition.rs:15` `let data_part = if let Some(stripped) = trimmed.strip_prefix("file,") {`
- `crates/ui/src/update/tests/definition_package/updates_parser.rs:29` `fn test_parse_updates_txt_comma_delimited() {`
