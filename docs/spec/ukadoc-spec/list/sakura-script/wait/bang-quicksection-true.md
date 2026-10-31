# \![quicksection,true]

- **規格**: [bang-quicksection-true.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/wait/bang-quicksection-true/) (ukadoc-spec/list/sakura-script/wait/bang-quicksection-true.md)
- **検索語**: Quick
- **対応状況**: ✅ 実装済

## 突合結果

\\_q / \\![quicksection,...] 高速表示制御タグのパース処理を実装 (crates/ui/src/script/command.rs -> SakuraCommand::Quick)。

## 実装箇所

- `crates/ui/src/lib.rs:86` `assert_eq!(commands[1], SakuraCommand::Quick(true));`
- `crates/ui/src/lib.rs:148` `assert_eq!(cmds_q[0], SakuraCommand::Quick(true));`
- `crates/ui/src/lib.rs:150` `assert_eq!(cmds_q[2], SakuraCommand::Quick(false));`
- `crates/ui/src/lib.rs:152` `assert_eq!(cmds_q[4], SakuraCommand::Quick(true));`
- `crates/ui/src/script/command.rs:11` `Quick(bool),  // \_q (高速表示トグル)`
