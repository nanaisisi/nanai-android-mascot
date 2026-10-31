# \![enter,passivemode]

- **規格**: [bang-enter-passivemode.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/misc/bang-enter-passivemode/) (ukadoc-spec/list/sakura-script/misc/bang-enter-passivemode.md)
- **検索語**: ModeChange
- **対応状況**: ✅ 実装済

## 突合結果

`\![enter,passivemode]` モード切替コマンドのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/raiselike.rs` -> `SakuraCommand::ModeChange`)。

## 実装箇所

- `crates/ui/src/script/command.rs:53` `ModeChange { mode: String, active: bool },`
- `crates/ui/src/script/parser/brackets/handlers/raiselike.rs:71` `callback(SakuraCommand::ModeChange {`
