# メール着信時に鳴らす音の指定

- **規格**: [pop.md](../../../../ukadoc-ssp/config/pop.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/pop/))
- **検索語**: pop, biff, sound
- **対応状況**: ✅ 実装済

## 突合結果

メール着信時の音声ファイル指定は未実装。


## 実装箇所

- `crates/nanai-vfs/src/path.rs:49` `parts.pop();`
- `src-tauri/src/common/paths.rs:203` `components.pop();`
- `ui/ts/ghost/shiori-notify/ghost-lifecycle/boot.ts:136` `.pop();`
- `ui/ts/ui/modal-settings-handlers.ts:559` `normalized.pop();`
- `tests/app-actions.test.ts:95` `await handle("biff");`
- `crates/nanai-vfs/src/path.rs:143` `current.pop();`
