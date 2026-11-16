# \pID番号

- **規格**: [pID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/scope/pID/) (ukadoc-spec/list/sakura-script/scope/pID.md)
- **検索語**: Target
- **対応状況**: ✅ 実装済

## 突合結果

スコープ切替タグ `\pN` のパース処理を実装 (`crates/ui/src/script/parser/mod.rs` -> `SakuraCommand::Target`).

## 実装箇所

- `crates/ui/src/script/parser/executor.rs:27` `Some(c @ '2'..='9') => callback(SakuraCommand::Target(c.to_digit(10).unwrap() as u8))`
- `ui/ts/ghost/sakura-rust-bridge.ts:47` `case "Target":`
- `crates/ui/src/script/command.rs:7` `Target(u8),   // \0, \1, \p[n]`
