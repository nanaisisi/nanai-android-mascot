# \![quicksection,false]

- **規格**: [bang-quicksection-false.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/wait/bang-quicksection-false/) (ukadoc-spec/list/sakura-script/wait/bang-quicksection-false.md)
- **検索語**: Quick
- **対応状況**: ⚠️ 一部対応

## 突合結果

\\_q / \\![quicksection,...] 高速表示制御タグのパース処理を実装 (crates/ui/src/script/command.rs -> SakuraCommand::Quick)。

## 実装箇所

- `crates/ui/src/script/command.rs:11` `Quick(bool),  // \_q (高速表示トグル)`
- `crates/ui/src/script/command.rs:193` `SakuraCommand::Quick(_)`
- `crates/ui/src/script/command.rs:233` `SakuraCommand::Quick(true).lifetime(),`
- `crates/ui/src/script/parser/brackets/mod.rs:129` `assert_eq!(cmds, vec![SakuraCommand::Quick(false)]);`
- `crates/ui/src/script/parser/brackets/handlers/raiselike/mod.rs:43` `callback(SakuraCommand::Quick(enabled));`
