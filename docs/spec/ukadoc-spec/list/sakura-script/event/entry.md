# \-

- **規格**: [entry.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/event/entry/) (ukadoc-spec/list/sakura-script/event/entry.md)
- **検索語**: Halt
- **対応状況**: ✅ 実装済

## 突合結果

`\-` (Halt/ゴースト終了) コマンドのパース処理を実装 (`crates/ui/src/script/parser/mod.rs`)。

## 実装箇所

- `crates/ui/src/lib.rs:121` `assert_eq!(commands[3], SakuraCommand::Halt);`
- `crates/ui/src/script/command.rs:62` `Halt,         // \- (ゴースト終了)`
- `crates/ui/src/script/parser/mod.rs:69` `Some('-') => callback(SakuraCommand::Halt),`
- `crates/ui/src/script/parser/mod.rs:94` `Some('-') => callback(SakuraCommand::Halt),  // \-`
- `ui/js/ghost/sakura-rust-bridge.js:84` `case "Halt":`
