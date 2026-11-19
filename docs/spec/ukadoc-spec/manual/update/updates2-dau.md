# updates2.dau

- **規格**: [update.md](../../../../ukadoc-spec/manual/update.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/update/))
- **検索語**: updates2.dau, generate_updates2_dau
- **対応状況**: ✅ 実装済

## 突合結果

更新対象ファイルの相対パス・MD5 ハッシュ値・`size=`・`date=`・`charset=` 等を `\x01` 区切りで列挙する `updates2.dau` について、取得・デコード・パース・ローカル比較・ダウンロード後 MD5 検証（破損/改竄検出）および生成機能を実装している。`src-tauri/src/commands/update/network/commands/check.rs:50-118` が `updates2.dau` を取得して `parse_update_definition`（`crates/ui/src/update/parser/update_definition.rs:6-86`）で解析し、並列 MD5 計算で更新候補を抽出する。ダウンロード時には `src-tauri/src/commands/update/network/commands/execute.rs:97-132` が MD5 を照合して不一致時に `md5 miss` で失敗扱いとする。また `src-tauri/src/commands/update/generation.rs:8-82`（`generate_updates2_dau`、`src-tauri/src/invoke.rs:91`）がディレクトリ走査による `updates2.dau` 生成を実装し、`src-tauri/src/ghost/scan/directory/scan.rs:68-74`・`src-tauri/src/ghost/scan/date.rs:65` も参照する（テスト: `crates/ui/src/update/tests/definition_package/updates_parser.rs:6`）。なお `ui/ts/ui/templates/settings-templates.ts:131` には開発設定向けチェックボックス UI テンプレートが存在する。

## 実装箇所

- `crates/ui/src/update/parser/update_definition.rs:6` `pub fn parse_update_definition(content: &str) -> Vec<UpdateEntry> {`
- `src-tauri/src/commands/update/network/commands/check.rs:51` `let url_dau = format!("{}updates2.dau", homeurl);`
- `src-tauri/src/commands/update/network/commands/execute.rs:103` `let mut hasher = Md5::new();`
- `src-tauri/src/commands/update/generation.rs:8` `pub async fn generate_updates2_dau(`
- `src-tauri/src/invoke.rs:91` `commands::update::generate_updates2_dau,`
- `crates/ui/src/update/tests/definition_package/updates_parser.rs:6` `fn test_parse_updates2_dau_byte1_delimited() {`
