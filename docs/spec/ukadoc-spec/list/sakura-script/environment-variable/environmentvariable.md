# 環境変数の記述例

- **規格**: [environmentvariable.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/environmentvariable/) (ukadoc-spec/list/sakura-script/environment-variable/environmentvariable.md)
- **検索語**: environmentvariable.md
- **対応状況**: ✅ 実装済

## 突合結果

さくらスクリプト内の環境変数・システム変数展開処理 (`crates/ui/src/script/env.rs` -> `expand_sakura_script_env`) にて `%username` 等の展開を実装済。

## 実装箇所

- `crates/ui/src/script/env.rs:2` `//! [environmentvariable.md], [notes_environmentvariable.md]`
