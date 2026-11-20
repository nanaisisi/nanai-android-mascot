# \_+

- **規格**: [_-plus.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/event/_-plus/) (ukadoc-spec/list/sakura-script/event/_-plus.md)
- **検索語**: Plus
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\_+` (Plus) コマンドのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/underscore.rs`)。

## 実装箇所

- `crates/ui/src/script/command.rs:47` `Plus,         // \+ / \_+`
- `ui/ts/ghost/sakura-rust-bridge.ts:95` `| { type: "Plus"; payload?: undefined }`
- `crates/ui/src/script/parser/executor.rs:125` `Some('+') => callback(SakuraCommand::Plus), // \+`
- `ui/ts/ghost/sakura-rust-bridge.ts:389` `case "Plus":`
- `crates/ui/src/script/parser/tests.rs:138` `assert!(cmds.contains(&SakuraCommand::Plus));`
- `crates/ui/src/script/parser/brackets/handlers/underscore/handlers.rs:210` `callback(SakuraCommand::Plus);`
