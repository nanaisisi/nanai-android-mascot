# \-

- **規格**: [entry.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/event/entry/) (ukadoc-spec/list/sakura-script/event/entry.md)
- **検索語**: Halt
- **対応状況**: ✅ 実装済

## 突合結果

`\-` (Halt/ゴースト終了) コマンドのパース処理を実装 (`crates/ui/src/script/parser/mod.rs`)。

## 実装箇所

- `crates/nanai-core/src/sakura_player.rs:39` `Halt,`
- `ui/ts/core/wasm/wasm-types.ts:19` `| "Halt";`
- `tests/sakura-rust-bridge.test.ts:34` `{ type: "Halt" },`
- `crates/nanai-core/src/sakura_player.rs:82` `return StepOutput::Halt;`
- `ui/ts/core/wasm/pkg/nanai_core.d.ts:76` `export type SakuraToken = { type: "Text"; value: string } | { type: "Scope"; val`
- `crates/nanai-core/src/sakura_player.rs:87` `return StepOutput::Halt;`
