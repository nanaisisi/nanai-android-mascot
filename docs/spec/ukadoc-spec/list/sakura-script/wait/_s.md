# \_s

- **規格**: [_s.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/wait/_s/) (ukadoc-spec/list/sakura-script/wait/_s.md)
- **検索語**: Sync
- **対応状況**: ✅ 実装済

## 突合結果

\\_s 複数キャラ同期発話制御タグのパース処理を実装 (crates/ui/src/script/command.rs -> SakuraCommand::Sync)。

## 実装箇所

- `src-tauri/src/shiori/dynamic/mod.rs:25` `unsafe impl Sync for ShioriDynamicEngine {}`
- `crates/ui/src/lib.rs:122` `assert_eq!(commands[4], SakuraCommand::Sync(true));`
- `crates/ui/src/lib.rs:160` `assert_eq!(cmds_ps[2], SakuraCommand::Sync(true));`
- `crates/ui/src/lib.rs:162` `assert_eq!(cmds_ps[4], SakuraCommand::Sync(false));`
- `crates/ui/src/script/command.rs:64` `Sync(bool),   // \_s (複数キャラ同期発話トグル)`
