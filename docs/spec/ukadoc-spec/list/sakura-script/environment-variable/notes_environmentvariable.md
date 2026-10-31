# 環境変数の指定方法

- **規格**: [notes_environmentvariable.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/notes_environmentvariable/) (ukadoc-spec/list/sakura-script/environment-variable/notes_environmentvariable.md)
- **検索語**: 環境変数の指定方法
- **対応状況**: ✅ 実装済

## 突合結果

さくらスクリプトパーサ内での `%username`, `%selfname`, 日時変数等の変数展開仕様に準拠した実装 (`crates/ui/src/script/env.rs`)。

## 実装箇所

- `crates/ui/src/script/env.rs`
