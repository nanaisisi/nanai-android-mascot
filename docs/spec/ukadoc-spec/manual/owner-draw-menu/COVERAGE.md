# オーナードローメニュー仕様 100%カバー対応表（完全詳細同期）

- **規格参照元**: [`docs/ukadoc-spec/manual/owner-draw-menu.md`](../../../../ukadoc-spec/manual/owner-draw-menu.md)
- **判定基準**: `docs/ukadoc-spec/manual/owner-draw-menu.md` に記載されているすべての仕様要件（ファイル名任意性、背景・前景・サイドバー画像、配置・アライメント、配色・フォント、フォールバック挙動）の実装および対応状況

## 仕様要件と実装の完全対照表

| `manual/owner-draw-menu.md` の仕様項目・ルール | 実装状態 | 該当コード / モジュール (`src-tauri/` / `ui/js/`) | 詳細解説・実装アプローチ |
| :--- | :---: | :--- | :--- |
| **ファイル名の任意性** (任意のファイル名を背景やサイドバーに指定可能) | ✅ 実装済 | [`shell/mod.rs`](../../../../src-tauri/src/commands/shell/mod.rs), [`submenu-theme.js`](../../../../ui/js/ui/submenu-theme.js) | シェルの `descript.txt` 内で任意のファイル名を `menu.background.bitmap.filename` 等としてパースし、動的に解決。 |
| **`menu_background.png`** (メニュー背景画像) | ✅ 実装済 | [`submenu-theme.js`](../../../../ui/js/ui/submenu-theme.js#L35) (`--menu-bg-image`) | VFS 経由で解決した画像パスを `convertFileSrc` で Webview URL に変換し、CSS 変数 `--menu-bg-image` に適用。 |
| **`menu_foreground.png`** (カーソル選択部画像) | ✅ 実装済 | [`submenu-theme.js`](../../../../ui/js/ui/submenu-theme.js#L75) (`--menu-fg-image`) | メニューツリーの選択カーソル部分に適用。未指定時は標準表示。 |
| **`menu_sidebar.png`** (左側サイドバー画像) | ✅ 実装済 | [`submenu-theme.js`](../../../../ui/js/ui/submenu-theme.js#L85) (`--menu-sidebar-image`) | サイドバー領域の幅と配置（top/bottom）を CSS カスタムプロパティ `--menu-sidebar-position` とクラス切替 (`has-sidebar`) で制御。 |
| **配置・アライメント** (`background_alignment` 等) | ✅ 実装済 | [`submenu-theme.js`](../../../../ui/js/ui/submenu-theme.js#L42) (`applyAlignment`) | `left top`, `right bottom`, `repeat-x`, `repeat-y`, `no-repeat` などのアライメント定義を解析し CSS へ反映。 |
| **シェル descript.txt vs SHIORI Resource 優先順位** | ✅ 実装済 | [`shiori/`](../../../../src-tauri/src/shiori/), [`submenu-theme.js`](../../../../ui/js/ui/submenu-theme.js) | SHIORI リソース側からの動的メニュー設定がシェル descript 設定を上書きする優先順位制御に対応。 |
| **フォールバック挙動** (未指定時の標準ポップアップ) | ✅ 実装済 | [`submenu-theme.js`](../../../../ui/js/ui/submenu-theme.js) | 画像やテーマ定義が未指定の場合はカスタムプロパティを削除し、標準のポップアップメニュー表示にフォールバック。 |
