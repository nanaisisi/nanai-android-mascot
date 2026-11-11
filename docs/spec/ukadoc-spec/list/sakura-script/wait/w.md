# \w時間

- **規格**: [w.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/wait/w/) (ukadoc-spec/list/sakura-script/wait/w.md)
- **検索語**: Wait
- **対応状況**: ⚠️ 一部対応

## 突合結果

\\w / \\_w[ms] / \\__w[ms] ウェイト指定タグのパース処理を実装 (crates/ui/src/script/command.rs -> SakuraCommand::Wait)。

## 実装箇所

- `crates/ui/src/script/command.rs:9` `Wait(u32),    // \w1..9, \_w[ms] (ミリ秒単位)`
- `crates/ui/src/script/ast/tests/ast_inspection.rs:209` `SakuraCommand::Wait(500),`
- `crates/ui/src/script/ast/tests/ast_inspection.rs:221` `SakuraCommand::Wait(300),`
- `crates/ui/src/script/ast/tests/ast_inspection.rs:233` `assert!(ast.has_command(&|cmd| matches!(cmd, SakuraCommand::Wait(_))));`
- `crates/ui/src/script/ast/tests/ast_inspection.rs:254` `assert!(!clean_ast.has_command(&|cmd| matches!(cmd, SakuraCommand::Wait(_))));`
