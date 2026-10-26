# オーナードローメニュー (manual/owner-draw-menu.md)

- **規格**: [manual/owner-draw-menu.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/owner-draw-menu.md)
- **対応状況**: ✅ 対応済

## 突合結果

- **配色設定の読込と適用**:
  - `src-tauri/src/ghost/scan/shell.rs:40-79` にてシェルの `descript.txt` 内のオーナードロー定義（`menu.background.color.*`, `menu.foreground.color.*`, `menu.background.font.color.*`, `menu.foreground.font.color.*`, `menu.disable.font.color.*`, `menu.separator.color.*`）を解析し `ShellMenuTheme` に格納。
  - `ui/js/ui/menu-submenu-renderer.js:169-234` および `ui/js/ui/submenu.js:232-288` にて、アクティブシェルの `menu_theme` 設定値（背景色、ハイライト色、文字色、非活性文字色、区切り線色）を CSS カスタムプロパティ（`--balloon-bg`, `--balloon-highlight-bg`, `--balloon-text-color`, `--balloon-highlight-text`, `--balloon-disable-text`, `--balloon-separator-color`）に動的適用。
- **画像ビットマップ定義の読込と描画**:
  - `src-tauri/src/ghost/scan/shell.rs:56-78` にて `menu.background.bitmap.filename`, `menu.foreground.bitmap.filename`, `menu.sidebar.bitmap.filename` のパスを取得・保持。
  - `ui/js/ui/menu-submenu-renderer.js` / `ui/js/ui/submenu.js` にて各ビットマップをアセットURL（`convertFileSrc`）経由で `--menu-bg-image`、`--menu-fg-image`、`--menu-sidebar-image` に設定。
  - `ui/css/context-menu.css` および `ui/css/submenu-window.css` にてメニュー全体の背景テクスチャタイル、選択・ホバー時のハイライト画像、およびサイドバー要素（`.menu-sidebar`）の描画レイアウトを実装。
- **メニュー動作・構造**:
  - メイン/サブキャラ分離やコンテキストメニューの動作・ショートカットキー対応は [howto/rclick](../ssp/howto/rclick.md) を参照。
