# \w時間

- **規格**: [w.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/wait/w/) (ukadoc-spec/list/sakura-script/wait/w.md)
- **検索語**: Wait
- **対応状況**: ✅ 実装済

## 突合結果

\\w / \\_w[ms] / \\__w[ms] ウェイト指定タグのパース処理を実装 (crates/ui/src/script/command.rs -> SakuraCommand::Wait)。

## 実装箇所

- `crates/ui/src/lib.rs:67` `assert_eq!(commands[3], SakuraCommand::Wait(250));`
- `crates/ui/src/lib.rs:87` `assert_eq!(commands[2], SakuraCommand::ClickWait);`
- `crates/ui/src/script/command.rs:9` `Wait(u32),    // \w1..9, \_w[ms] (ミリ秒単位)`
- `crates/ui/src/script/command.rs:10` `ClickWait,    // \x (クリック/入力待ち)`
- `crates/ui/src/script/command.rs:38` `AudioWait, // \a`
