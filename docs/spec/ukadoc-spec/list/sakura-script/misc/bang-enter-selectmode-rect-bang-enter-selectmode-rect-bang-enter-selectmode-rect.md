# \![enter,selectmode,モード(rect),左,上,右,下]\![enter,selectmode,モード(rect),当たり判定名]\![enter,selectmode,モード(rect)]

- **規格**: [bang-enter-selectmode-rect-bang-enter-selectmode-rect-bang-enter-selectmode-rect.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/misc/bang-enter-selectmode-rect-bang-enter-selectmode-rect-bang-enter-selectmode-rect/) (ukadoc-spec/list/sakura-script/misc/bang-enter-selectmode-rect-bang-enter-selectmode-rect-bang-enter-selectmode-rect.md)
- **検索語**: ModeChange
- **対応状況**: ✅ 実装済

## 突合結果

`\![enter,selectmode,...]` モード切替コマンドのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/raiselike.rs` -> `SakuraCommand::ModeChange`)。

## 実装箇所

- `crates/ui/src/script/command.rs:54` `ModeChange { mode: String, active: bool },`
- `crates/ui/src/script/parser/brackets/handlers/raiselike.rs:71` `callback(SakuraCommand::ModeChange {`
