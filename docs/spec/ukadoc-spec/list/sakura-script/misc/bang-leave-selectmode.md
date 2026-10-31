# \![leave,selectmode]

- **規格**: [bang-leave-selectmode.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/misc/bang-leave-selectmode/) (ukadoc-spec/list/sakura-script/misc/bang-leave-selectmode.md)
- **検索語**: ModeChange
- **対応状況**: ✅ 実装済

## 突合結果

`\![leave,selectmode]` モード切替コマンドのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/raiselike.rs` -> `SakuraCommand::ModeChange`)。

## 実装箇所

- `crates/ui/src/script/command.rs:53` `ModeChange { mode: String, active: bool },`
- `crates/ui/src/script/parser/brackets/handlers/raiselike.rs:71` `callback(SakuraCommand::ModeChange {`
