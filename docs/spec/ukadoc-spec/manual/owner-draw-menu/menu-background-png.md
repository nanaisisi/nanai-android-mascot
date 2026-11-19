# `menu_background.png`

- **規格**: [owner-draw-menu.md](../../../../ukadoc-spec/manual/owner-draw-menu.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/owner-draw-menu/))
- **検索語**: menu_background.png
- **対応状況**: ⚠️ 一部対応

## 突合結果

`extract_shell_menu_theme` が `menu.background.bitmap.filename` 等の `descript.txt` 指定またはフォールバック名 `menu_background.png` を読み込み、フロントエンドの `menuThemeRenderer`・`applyShellMenuTheme`・`context-menu.css` / `submenu-window.css` が `--menu-bg-image` としてメニュー領域サイズで表示する。ただし `load_menu_bitmap_data_url` はファイル不在時に 1x1 白 PNG Data URL を生成するため、画像省略時に標準メニュー表示へ戻る動作に一部乖離がある。

## 実装箇所

- `src-tauri/src/ghost/scan/shell/theme.rs:42` `let bg_bmp = merged`
- `src-tauri/src/ghost/scan/shell/bitmap.rs:53` `if normalized.to_ascii_lowercase().contains("background")`
- `ui/ts/ui/app-menu.ts:83` `background_bitmap:`
- `ui/ts/ui/renderers/menu-theme-renderer.ts:180` `if (bgUrl) {`
- `ui/ts/ui/submenu-theme.ts:133` `if (bgUrl) {`
- `ui/css/context-menu.css:73` `background-image: var(--menu-bg-image, var(--balloon-pattern, none));`
- `ui/css/submenu-window.css:17` `background-image: var(--menu-bg-image, var(--balloon-pattern, none));`
- `tests/menu-renderers.test.ts:215` `background_bitmap: "http://example.com/bg.png", // covers http:// prefix (line 63)`
