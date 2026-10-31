# \t

- **規格**: [t.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/wait/t/) (ukadoc-spec/list/sakura-script/wait/t.md)
- **検索語**: Timeout
- **対応状況**: ✅ 実装済

## 突合結果

\\t タイムアウト抑止タグのパース処理を実装 (crates/ui/src/script/command.rs -> SakuraCommand::Timeout)。

## 実装箇所

- `crates/ui/src/lib.rs:120` `assert_eq!(commands[2], SakuraCommand::Timeout);`
- `crates/ui/src/script/command.rs:62` `Timeout,      // \t (タイムアウト抑止)`
- `crates/ui/src/script/command.rs:86` `ChoiceTimeout(u32),`
- `crates/ui/src/script/command.rs:91` `BalloonTimeout(u32),`
- `crates/ui/src/script/command.rs:141` `SetHttpTimeout(u32),`
