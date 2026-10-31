# オーナードローメニュー仕様 100%カバー対応表（完全同期）

- **規格参照元**: [`docs/ukadoc-spec/manual/owner-draw-menu.md`](../../../../ukadoc-spec/manual/owner-draw-menu.md)
- **判定基準**: `docs/ukadoc-spec/manual/owner-draw-menu.md` に記載されているすべてのメニュー背景・前景・サイドバー画像、descript.txt設定、SHIORIリソース連携項目の実装および対応状況

## 対応表一覧

| 項目・ファイル (`manual/owner-draw-menu.md`) | 当リポジトリの監査ファイル (`manual/owner-draw-menu/`) | 対応状況 | 実装ソースコード (Rust / JS) |
| :--- | :--- | :---: | :--- |
| **`menu_background.png`** (メニュー背景) | [menu-bitmaps.md](menu-bitmaps.md) | ✅ 実装済 | [`submenu.js`](../../../../ui/js/ui/submenu.js), [`commands/shell/mod.rs`](../../../../src-tauri/src/commands/shell/mod.rs) |
| **`menu_foreground.png`** (メニューカーソル) | [menu-bitmaps.md](menu-bitmaps.md) | ✅ 実装済 | [`submenu.js`](../../../../ui/js/ui/submenu.js), [`commands/shell/mod.rs`](../../../../src-tauri/src/commands/shell/mod.rs) |
| **`menu_sidebar.png`** (メニューサイドバー) | [menu-bitmaps.md](menu-bitmaps.md) | ✅ 実装済 | [`submenu.js`](../../../../ui/js/ui/submenu.js), [`commands/shell/mod.rs`](../../../../src-tauri/src/commands/shell/mod.rs) |
| **シェル descript.txt メニュープロパティ** (`menu.*`) | [menu-colors.md](menu-colors.md) | ✅ 実装済 | [`submenu.js`](../../../../ui/js/ui/submenu.js), [`shell_manifest`](../../../../src-tauri/src/commands/shell/mod.rs) |
| **メニューフォント設定** (`menu.font.*`) | [menu-fonts.md](menu-fonts.md) | ✅ 実装済 | [`submenu.js`](../../../../ui/js/ui/submenu.js) |
| **SHIORI Resource 連携** (動的メニュー変更) | [README.md](README.md) | ✅ 実装済 | [`shiori/`](../../../../src-tauri/src/shiori/), [`submenu.js`](../../../../ui/js/ui/submenu.js) |
