# `menu_sidebar.png`

- **規格**: [owner-draw-menu.md](../../../../ukadoc-spec/manual/owner-draw-menu.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/owner-draw-menu/))
- **検索語**: menu_sidebar.png
- **対応状況**: ✅ 実装済

## 突合結果

`extract_shell_menu_theme` が `menu.sidebar.bitmap.filename` 等の指定および `menu_sidebar.png` の外部ファイルを読み込み、`menuThemeRenderer` と `applyShellMenuTheme` が `body.has-sidebar` と画像の `naturalWidth` に基づく `--menu-sidebar-width` を反映して `.menu-sidebar` に描画する。`load_menu_bitmap_data_url` は内蔵ダミー PNG の生成や `shell_dir` への実ファイル書き出しを行わず、外部ファイル不在時は `None` を返却する。

## 実装箇所

- `src-tauri/src/ghost/scan/shell/theme.rs:61` `let side_bmp = merged`
- `src-tauri/src/ghost/scan/shell/bitmap.rs:86` `if normalized.to_ascii_lowercase().contains("sidebar") || normalized == "menu_sidebar.png" {`
- `ui/ts/ui/renderers/menu-theme-renderer.ts:198` `if (sideUrl) {`
- `ui/ts/ui/submenu-theme.ts:151` `if (sideUrl) {`
- `ui/css/context-menu.css:85` `.menu-sidebar {`
- `ui/css/context-menu.css:102` `body.has-sidebar .menu-sidebar {`
- `tests/submenu-theme.test.ts:63` `assert.equal(document.body.classList.contains("has-sidebar"), true);`
