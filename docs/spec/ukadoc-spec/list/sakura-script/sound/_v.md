# \_v[ファイル名]

- **規格**: [_v.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/sound/_v/) (ukadoc-spec/list/sakura-script/sound/_v.md)
- **検索語**: Voice
- **対応状況**: ⚠️ 一部対応

## 突合結果

\\_v / \\8[file] サウンド再生コマンドのパース処理を実装 (crates/ui/src/script/command.rs -> SakuraCommand::Voice)。

## 実装箇所

- `crates/nanai-core/src/sakura_player.rs:23` `Voice { scope: u32, path: String },`
- `ui/ts/core/wasm/pkg/nanai_core.d.ts:237` `export type SakuraToken = { type: "Text"; value: string } | { type: "Scope"; val`
- `crates/nanai-core/src/sakura_player.rs:151` `SakuraToken::Voice { path } => StepOutput::Voice {`
- `ui/ts/core/wasm/pkg/nanai_core.d.ts:243` `export type StepOutput = { action: "TextAppend"; data: { scope: number; text: st`
- `crates/nanai-core/src/sakura_player.rs:272` `StepOutput::Voice {`
- `ui/ts/ghost/sakura-rust-bridge.ts:112` `| { type: "Voice"; payload?: string }`
