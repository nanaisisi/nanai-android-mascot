# dev/update.md 規格対応文書

- **参照規格**: [ukadoc-spec/dev/update.md](../../../../ukadoc-spec/dev/update.md) (ネットワーク更新仕様)
- **対応状況**: ⚠️ 一部対応

## 突合結果

- `updates.txt` および `updates2.dau` のフォーマット解析、差分ファイル取得、安全な差分適用プロトコルの実装。

## 実装箇所

- `src-tauri/src/lib.rs:178` `commands::update::network::commands::check_ghost_update,`
- `src-tauri/src/lib.rs:179` `commands::update::network::commands::execute_ghost_update,`
- `src-tauri/src/lib.rs:180` `commands::update::generate_updates2_dau,`
- `src-tauri/src/commands/mod.rs:8` `pub mod update;`
- `src-tauri/src/commands/update/dau.rs:32` `hasher.update(&data);`
