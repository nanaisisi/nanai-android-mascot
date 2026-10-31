# \p[ID番号]

- **規格**: [p-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/scope/p-ID/) (ukadoc-spec/list/sakura-script/scope/p-ID.md)
- **検索語**: Target
- **対応状況**: ✅ 実装済

## 突合結果

スコープ切替タグ `\p[N]` のパース処理を実装 (`crates/ui/src/script/parser/mod.rs` -> `SakuraCommand::Target`).

## 実装箇所

- `crates/ui/src/lib.rs:64` `assert_eq!(commands[0], SakuraCommand::Target(0));`
- `crates/ui/src/lib.rs:85` `assert_eq!(commands[0], SakuraCommand::Target(0));`
- `crates/ui/src/lib.rs:158` `assert_eq!(cmds_ps[0], SakuraCommand::Target(2));`
- `crates/ui/src/lib.rs:159` `assert_eq!(cmds_ps[1], SakuraCommand::Target(3));`
- `crates/ui/src/lib.rs:172` `assert_eq!(commands[0], SakuraCommand::Target(0)); // \h`
