# dev/update.md 規格対応文書

- **参照規格**: [ukadoc-spec/dev/update.md](../../../../ukadoc-spec/dev/update.md) (ネットワーク更新仕様)
- **対応状況**: ✅ 実装済

## 突合結果

- `updates.txt` および `updates2.dau` のフォーマット解析、差分ファイル取得、安全な差分適用プロトコルの実装。

## 実装箇所

- `crates/ui/src/lib.rs:12` `pub mod update;`
- `src-tauri/src/lib.rs:198` `commands::update::network::commands::check_ghost_update,`
- `ui/main.ts:16` `import { updateMethods } from "./ts/core/app-update.js";`
- `ui/menu-iframe.html:30` `<button type="button" class="menu-item main-only" id="update-btn" role="menuitem`
- `tests/app-actions.test.ts:49` `await handle("update");`
- `crates/ui/src/lib.rs:52` `pub use update::{`
