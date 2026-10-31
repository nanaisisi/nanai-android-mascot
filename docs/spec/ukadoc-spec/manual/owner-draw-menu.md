# オーナードローメニュー (manual/owner-draw-menu.md)

- **規格**: [manual/owner-draw-menu.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/owner-draw-menu.md)
- **対応状況**: ❌ 未実装

## 実ファイルハンドリング突合結果

- **メニュービットマップ定義の読込**: `menu.background.bitmap.filename`, `menu.foreground.bitmap.filename`, `menu.sidebar.bitmap.filename` などの設定値をシェル descript からパース。
- **実ファイルアセット適用**: VFS 経由で取得した画像パスを Tauri の `convertFileSrc` で安全に Webview URL に変換し、CSS カスタムプロパティ経由でメニュー背景・サイドバーのテクスチャとして実ファイルを描画 (`ui/js/ui/submenu.js`)。
