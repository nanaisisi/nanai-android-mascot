# \x

- **規格**: [x.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/wait/x/) (ukadoc-spec/list/sakura-script/wait/x.md)
- **検索語**: ClickWait
- **対応状況**: ✅ 実装済

## 突合結果

\\x 入力/クリック待ちタグのパース処理を実装 (crates/ui/src/script/command.rs -> SakuraCommand::ClickWait)。

## 実装箇所

- `crates/ui/src/lib.rs:87` `assert_eq!(commands[2], SakuraCommand::ClickWait);`
- `crates/ui/src/script/command.rs:10` `ClickWait,    // \x (クリック/入力待ち)`
- `crates/ui/src/script/parser/mod.rs:51` `Some('x') => callback(SakuraCommand::ClickWait),`
- `ui/js/ghost/sakura-rust-bridge.js:23` `case "ClickWait":`
