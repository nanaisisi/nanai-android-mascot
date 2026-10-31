# dev/update.md 規格対応文書

- **参照規格**: [ukadoc-spec/dev/update.md](../../../../ukadoc-spec/dev/update.md) (ネットワーク更新仕様)
- **対応状況**: ✅ 対応済

## 突合結果

- `updates.txt` および `updates2.dau` のフォーマット解析、差分ファイル取得、安全な差分適用プロトコルの実装。

## 実装箇所

- `src-tauri/tauri.conf.json:45` `"updater": {`
- `src-tauri/src/lib.rs:151` `commands::update::check_ghost_update,`
- `src-tauri/src/lib.rs:152` `commands::update::execute_ghost_update,`
- `src-tauri/src/commands/mod.rs:8` `pub mod update;`
- `src-tauri/src/commands/install/archive/postprocess.rs:73` `let (install_date, update_date) = crate::ghost::scan::compute_ghost_dates(target`
