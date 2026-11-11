# \p[ID番号]

- **規格**: [p-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/scope/p-ID/) (ukadoc-spec/list/sakura-script/scope/p-ID.md)
- **検索語**: Target
- **対応状況**: ⚠️ 一部対応

## 突合結果

スコープ切替タグ `\p[N]` のパース処理を実装 (`crates/ui/src/script/parser/mod.rs` -> `SakuraCommand::Target`).

## 実装箇所

- `crates/ui/src/script/command.rs:7` `Target(u8),   // \0, \1, \p[n]`
- `crates/ui/src/script/ast/builder.rs:12` `SakuraCommand::Target(scope) => {`
- `crates/ui/src/script/ast/builder.rs:77` `SakuraCommand::Target(0),`
- `crates/ui/src/script/ast/builder.rs:89` `SakuraCommand::Target(1),`
- `crates/ui/src/script/ast/builder.rs:121` `let commands = vec![SakuraCommand::Target(0)];`
