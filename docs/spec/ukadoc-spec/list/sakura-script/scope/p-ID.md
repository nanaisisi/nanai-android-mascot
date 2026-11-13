# \p[ID番号]

- **規格**: [p-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/scope/p-ID/) (ukadoc-spec/list/sakura-script/scope/p-ID.md)
- **検索語**: Target
- **対応状況**: ✅ 実装済

## 突合結果

スコープ切替タグ `\p[N]` のパース処理を実装 (`crates/ui/src/script/parser/mod.rs` -> `SakuraCommand::Target`).

## 実装箇所

- `crates/nanai-vfs/src/tests/path_encoding.rs:71` `let file_path = sub_dir.join("Target.txt");`
- `ui/ts/ghost/sakura-rust-bridge.ts:47` `case "Target":`
- `tests/sakura-rust-bridge.test.ts:10` `{ type: "Target", payload: 1 },`
- `crates/ui/src/script/command.rs:7` `Target(u8),   // \0, \1, \p[n]`
- `tests/parser-fuzzing/rust-bridge-fuzzing.test.ts:10` `{ type: "Target", payload: null },`
- `crates/ui/src/script/ast/builder.rs:12` `SakuraCommand::Target(scope) => {`
