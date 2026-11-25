# サーバにアップロードする

- **規格**: [update.md](../../../../ukadoc-spec/dev/update.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/dev/update/))
- **検索語**: updates2.dau
- **対応状況**: ⚠️ 一部対応

## 突合結果

配布側のアップロード手順であり、ランタイム側では対象外。

## 実装箇所

- `crates/ui/src/update/parser/update_definition.rs:1` `//! updates2.dau / updates.txt アップデート定義パース処理モジュール`
- `src-tauri/src/commands/update/generation.rs:1` `//! Update definition generation implementation (updates2.dau / updates.txt)`
- `crates/ui/src/update/parser/update_definition.rs:5` `/// updates2.dau (updates2dau) または updates.txt (updatestxt) の内容をパース`
- `src-tauri/src/commands/update/generation.rs:45` `|| file_name == "updates2.dau"`
- `crates/ui/src/update/parser/update_definition.rs:41` `// [相対パス,ignore], [補足]: updates_def.txt / updates2.dau における相対パス指定、ignore, readon`
- `src-tauri/src/commands/update/generation.rs:70` `let dau_path = dir.join("updates2.dau");`
