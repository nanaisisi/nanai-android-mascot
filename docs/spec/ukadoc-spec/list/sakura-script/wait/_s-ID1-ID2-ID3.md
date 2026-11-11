# \_s[ID1,ID2,ID3...]

- **規格**: [_s-ID1-ID2-ID3.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/wait/_s-ID1-ID2-ID3/) (ukadoc-spec/list/sakura-script/wait/_s-ID1-ID2-ID3.md)
- **検索語**: Sync
- **対応状況**: ⚠️ 一部対応

## 突合結果

\\_s 複数キャラ同期発話制御タグのパース処理を実装 (crates/ui/src/script/command.rs -> SakuraCommand::Sync)。

## 実装箇所

- `src-tauri/src/shiori/dynamic/engine.rs:32` `unsafe impl Sync for ShioriDynamicEngine {}`
- `crates/nanai-vfs/src/traits.rs:7` `pub trait VirtualFileSystem: Send + Sync {`
- `crates/ui/src/script/command.rs:84` `Sync(bool), // \_s (複数キャラ同期発話トグル)`
- `crates/ui/src/script/command.rs:194` `| SakuraCommand::Sync(_)`
- `crates/ui/src/script/command.rs:237` `SakuraCommand::Sync(true).lifetime(),`
