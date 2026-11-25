# 「.dau」がサーバに弾かれてしまう場合について

- **規格**: [update.md](../../../../ukadoc-spec/dev/update.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/dev/update/))
- **検索語**: updates.txt
- **対応状況**: ⚠️ 一部対応

## 突合結果

updates2.dau だけでなく updates.txt 形式へのフォールバックにも対応。

## 実装箇所

- `crates/ui/src/update/parser/update_definition.rs:1` `//! updates2.dau / updates.txt アップデート定義パース処理モジュール`
- `src-tauri/src/commands/update/generation.rs:1` `//! Update definition generation implementation (updates2.dau / updates.txt)`
- `crates/ui/src/update/parser/update_definition.rs:5` `/// updates2.dau (updates2dau) または updates.txt (updatestxt) の内容をパース`
- `src-tauri/src/commands/update/generation.rs:46` `|| file_name == "updates.txt"`
- `crates/ui/src/update/parser/update_definition.rs:14` `// updates.txt の場合: "file," プレフィックス`
- `src-tauri/src/commands/update/network/commands/check.rs:13` `format!("{}/updates.txt", base),`
