# \-

- **規格**: [entry.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/event/entry/) (ukadoc-spec/list/sakura-script/event/entry.md)
- **検索語**: Halt
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\-` (Halt/ゴースト終了) コマンドのパース処理を実装 (`crates/ui/src/script/parser/mod.rs`)。

## 実装箇所

- `crates/nanai-core/src/sakura_player.rs:39` `Halt,`
- `crates/nanai-core/src/sakura_player.rs:82` `return StepOutput::Halt;`
- `crates/nanai-core/src/sakura_player.rs:87` `return StepOutput::Halt;`
- `crates/nanai-core/src/sakura_player.rs:152` `SakuraToken::Halt => {`
- `crates/nanai-core/src/sakura_player.rs:154` `StepOutput::Halt`
