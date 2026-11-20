# `shell/master/thumbnail.png`

- **規格**: [shell.md](../../../../ukadoc-spec/manual/shell.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/shell/))
- **検索語**: find_shell_thumbnail, get_shell_thumbnail
- **対応状況**: ✅ 実装済

## 実装箇所

- `find_shell_thumbnail, get_shell_thumbnail` (`src-tauri/src/commands/shell/manifest.rs`)。ファイルは外部ファイルから読み込み、単体テスト `readme_and_thumbnail_loaded_from_files` あり。
- `menuGhostShellRenderer.renderShellSubmenu` (`ui/ts/ui/renderers/menu-ghost-shell-renderer.ts`)。シェル切り替えサブメニュー描画時に `get_shell_thumbnail` を呼び出して `thumbnail.png` を表示（`ui/css/context-menu.css`, `ui/css/submenu-window.css`）。

