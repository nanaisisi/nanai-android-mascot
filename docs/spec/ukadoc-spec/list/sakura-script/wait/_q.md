# \_q

- **規格**: [_q.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/wait/_q/) (ukadoc-spec/list/sakura-script/wait/_q.md)
- **検索語**: Quick
- **対応状況**: ✅ 実装済

## 突合結果

\\_q / \\![quicksection,...] 高速表示制御タグのパース処理を実装 (crates/ui/src/script/command.rs -> SakuraCommand::Quick)。

## 実装箇所

- `crates/nanai-core/src/sakura_player.rs:149` `SakuraToken::Font { .. } | SakuraToken::Sync(_) | SakuraToken::Quick(_) => {`
- `ui/ts/ghost/sakura-rust-bridge.ts:59` `case "Quick":`
- `tests/sakura-rust-bridge.test.ts:14` `{ type: "Quick", payload: true },`
- `crates/nanai-core/src/sakura_script.rs:36` `Quick(bool),`
- `crates/nanai-core/src/sakura_script.rs:170` `tokens.push(SakuraToken::Quick(true));`
- `crates/nanai-core/ui/ts/core/wasm/pkg/nanai_core.d.ts:101` `export type SakuraToken = { type: "Text"; value: string } | { type: "Scope"; val`
