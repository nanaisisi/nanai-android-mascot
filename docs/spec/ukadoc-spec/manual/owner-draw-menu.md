# オーナードローメニュー (manual/owner-draw-menu.md)

- **規格**: [manual/owner-draw-menu.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/owner-draw-menu.md)
- **検索語**: manual/owner-draw-menu.md
- **対応状況**: ✅ 実装済

## 実ファイルハンドリング突合結果

- **メニュービットマップ定義の読込**: `menu.background.bitmap.filename`, `menu.foreground.bitmap.filename`, `menu.sidebar.bitmap.filename` などの設定値をシェル descript からパース。
- **実ファイルアセット適用**: VFS 経由で取得した画像パスを Tauri の `convertFileSrc` で安全に Webview URL に変換し、CSS カスタムプロパティ経由でメニュー背景・サイドバーのテクスチャとして実ファイルを描画 (`ui/js/ui/submenu.js`)。
- **オーナードローキャプション完全解決**: UKADOC ownerdraw-item-name 準拠の標準ボタン全項目（92種）のキャプション解決・反映機構を `ui/js/ui/renderers/menu-caption-renderer.js` に実装。

## 実装箇所

- `ui/js/ui/submenu-theme.js:15` `* シェル descript のオーナードローメニュー設定（背景・サイドバー・フォント・配色）を適用`
- `ui/js/ui/renderers/menu-caption-renderer.js:10` `export const MENU_CAPTION_DEFINITIONS = [`
- `src-tauri/src/shiori/property.rs:180` `evaluate_property_query`
