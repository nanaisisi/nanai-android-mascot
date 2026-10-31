# アンインストール (`uninstall_ghost`)

- **対応状況**: ✅ 実装済

ゴーストや関連アセットフォルダの安全な削除・クリーンアップ処理（`uninstall_ghost`）を実装。


## 実装箇所

- `src-tauri/src/lib.rs:105` `commands::shell::uninstall_ghost,`
- `src-tauri/src/commands/shell/ghost.rs:9` `pub async fn uninstall_ghost(`
- `src-tauri/src/commands/window/menu_native.rs:70` `.text("uninstall", "🗑️ アンインストール (D)")`
- `ui/menu-iframe.html:64` `id="uninstall-btn"`
- `ui/menu-iframe.html:66` `data-action="uninstall-ghost"`
