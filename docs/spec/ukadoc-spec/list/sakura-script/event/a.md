# \a

- **規格**: [a.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/event/a/) (ukadoc-spec/list/sakura-script/event/a.md)
- **検索語**: AudioWait
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\a` (AudioWait) コマンドのパース処理を実装 (`crates/ui/src/script/parser/mod.rs`)。

## 実装箇所

- `crates/ui/src/script/command.rs:45` `AudioWait,    // \a`
- `ui/ts/ghost/sakura-rust-bridge.ts:93` `| { type: "AudioWait"; payload?: undefined }`
- `crates/ui/src/script/parser/executor.rs:117` `Some('a') => callback(SakuraCommand::AudioWait), // \a`
- `ui/ts/ghost/sakura-rust-bridge.ts:379` `case "AudioWait":`
- `crates/ui/src/script/parser/tests.rs:136` `assert!(cmds.contains(&SakuraCommand::AudioWait));`
