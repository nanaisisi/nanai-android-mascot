# \_!

- **規格**: [_-bang.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/-bang/)
- **検索語**: \_!
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\_!` (NoUserBreak) タグのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/underscore.rs`)。


## 実装箇所

- `crates/nanai-core/src/sakura_script/types.rs:219` `/// Rawモード切替 (\_?, \_!)`
- `crates/nanai-core/src/sakura_script/parser/extended_tags.rs:1` `//! 拡張さくらスクリプトタグ (\_w, \__q, \_u, \_m, \_s, \_q, \_n, \_?, \_!, \_a) パース処理`
- `crates/ui/src/script/command.rs:64` `NoUserBreak(bool), // \_!`
- `crates/ui/src/script/parser/executor.rs:58` `// \_w / \_q / \_a / \_s / \_l / \_! / \_\_v / \_\_q`
- `crates/ui/src/script/parser/tests.rs:93` `\\_!\`
