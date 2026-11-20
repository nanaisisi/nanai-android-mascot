# \_n

- **規格**: [_n.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/n/) (ukadoc-spec/spec/ukadoc-spec/list/sakura-script/balloon-text/_n.md)
- **検索語**: \_n
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\_n` (NewLineNoPause) タグのパーサ処理を実装 (`crates/ui/src/script/parser/brackets/handlers/underscore.rs`)。


## 実装箇所

- `crates/nanai-core/src/sakura_script/types.rs:217` `/// オートラップ無効化 (\_n)`
- `crates/nanai-core/src/sakura_script/parser/extended_tags.rs:1` `//! 拡張さくらスクリプトタグ (\_w, \__q, \_u, \_m, \_s, \_q, \_n, \_?, \_!, \_a) パース処理`
- `crates/ui/src/script/command.rs:15` `NewLineNoPause, // \_n`
- `crates/ui/src/script/parser/tests.rs:92` `\\_n\`
- `crates/ui/src/script/parser/tests.rs:116` `let script = "\\_?\\0\\s0\\nRawText\\_?\\_nNoAutoWrapText\\_n";`
