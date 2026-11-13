# \_s[ID1,ID2,ID3...]

- **規格**: [_s-ID1-ID2-ID3.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/wait/_s-ID1-ID2-ID3/) (ukadoc-spec/list/sakura-script/wait/_s-ID1-ID2-ID3.md)
- **検索語**: Sync
- **対応状況**: ✅ 実装済

## 突合結果

\\_s 複数キャラ同期発話制御タグのパース処理を実装 (crates/ui/src/script/command.rs -> SakuraCommand::Sync)。

## 実装箇所

- `crates/nanai-core/src/sakura_player.rs:149` `SakuraToken::Font { .. } | SakuraToken::Sync(_) | SakuraToken::Quick(_) => {`
- `src-tauri/src/shiori/dynamic/engine.rs:32` `unsafe impl Sync for ShioriDynamicEngine {}`
- `ui/ts/ghost/sakura-rust-bridge.ts:152` `case "Sync":`
- `tests/sakura-rust-bridge.test.ts:35` `{ type: "Sync", payload: true },`
- `crates/nanai-core/src/sakura_script.rs:34` `Sync(bool),`
- `crates/nanai-core/src/sakura_script.rs:167` `tokens.push(SakuraToken::Sync(true));`
