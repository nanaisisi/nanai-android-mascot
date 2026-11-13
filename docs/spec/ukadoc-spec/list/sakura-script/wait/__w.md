# \__w[時間]

- **規格**: [__w.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/wait/__w/) (ukadoc-spec/list/sakura-script/wait/__w.md)
- **検索語**: Wait
- **対応状況**: ✅ 実装済

## 突合結果

\\w / \\_w[ms] / \\__w[ms] ウェイト指定タグのパース処理を実装 (crates/ui/src/script/command.rs -> SakuraCommand::Wait)。

## 実装箇所

- `crates/nanai-core/src/sakura_player.rs:37` `Wait { duration_ms: u32 },`
- `ui/ts/core/wasm/wasm-types.ts:15` `| "Wait"`
- `tests/sakura-rust-bridge.test.ts:12` `{ type: "Wait", payload: 200 },`
- `crates/nanai-core/src/sakura_player.rs:138` `SakuraToken::Wait(ms) => StepOutput::Wait { duration_ms: ms },`
- `ui/ts/core/wasm/pkg/nanai_core.d.ts:76` `export type SakuraToken = { type: "Text"; value: string } | { type: "Scope"; val`
- `tests/parser-fuzzing/rust-bridge-fuzzing.test.ts:13` `{ type: "Wait", payload: undefined },`
