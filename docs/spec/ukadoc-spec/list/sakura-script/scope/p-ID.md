# \p[ID番号]

- **規格**: [p-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/scope/p-ID/) (ukadoc-spec/list/sakura-script/scope/p-ID.md)
- **検索語**: Target
- **対応状況**: ✅ 実装済

## 突合結果

スコープ切替タグ `\p[N]` のパース処理を実装 (`crates/ui/src/script/parser/mod.rs` -> `SakuraCommand::Target`).

## 実装箇所

- `crates/ui/src/script/parser/executor.rs:28` `Some('p') => { if let Some(n) = brackets::handle_target_p(&mut chars) { callback(SakuraCommand::Target(n)); } }`
- `crates/ui/src/script/parser/brackets/handlers/basic.rs:55` `pub(crate) fn handle_target_p(...) -> Option<u8>`
- `ui/ts/ghost/sakura-rust-bridge.ts:47` `case "Target":`
- `crates/ui/src/script/command.rs:7` `Target(u8),   // \0, \1, \p[n]`
