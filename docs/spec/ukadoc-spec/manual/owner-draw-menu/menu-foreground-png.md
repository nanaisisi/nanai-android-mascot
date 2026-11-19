# `menu_foreground.png`

- **規格**: [owner-draw-menu.md](../../../../ukadoc-spec/manual/owner-draw-menu.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/owner-draw-menu/))
- **検索語**: menu_foreground.png
- **対応状況**: ✅ 実装済

## 突合結果

`extract_shell_menu_theme` が `menu.foreground.bitmap.filename` 等の指定およびフォールバック名 `menu_foreground.png` の外部ファイルを読み込み、フロントエンドが `--menu-fg-image` を設定して `:hover` / `:focus` / `.is-current` の選択カーソル行へ適用する。`load_menu_bitmap_data_url` は内蔵ダミー PNG を生成せず、外部ファイル不在時は `None` を返却するため、画像省略時は標準表示へフォールバックする。

## 実装箇所

- `src-tauri/src/ghost/scan/shell/theme.rs:51` `let fg_bmp = merged`
- `src-tauri/src/ghost/scan/shell/bitmap.rs:69` `if normalized.to_ascii_lowercase().contains("foreground")`
- `ui/ts/ui/renderers/menu-theme-renderer.ts:189` `if (fgUrl) {`
- `ui/ts/ui/submenu-theme.ts:142` `if (fgUrl) {`
- `ui/css/context-menu.css:171` `.menu-item:hover,`
- `ui/css/submenu-window.css:64` `.submenu-window-container .menu-item:hover,`
- `tests/submenu-theme.test.ts:50` `foreground_bitmap: "data:image/png;base64,abc",`
