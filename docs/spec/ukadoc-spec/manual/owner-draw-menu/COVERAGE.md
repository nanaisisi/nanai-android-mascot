# オーナードローメニュー仕様 100%カバー対応表（ファイルツリー完全同期）

- **規格参照元**: [`docs/ukadoc-spec/manual/owner-draw-menu.md`](../../../../ukadoc-spec/manual/owner-draw-menu.md)
- **判定基準**: `docs/ukadoc-spec/manual/owner-draw-menu.md` のファイルツリー（オーナードローメニュー解説内で参照されているシェルファイル構成全項目）に記載されているすべてのファイルの実施状況

## 対応表一覧

| ファイルツリー項目 (`manual/owner-draw-menu.md`) | 当リポジトリの監査ファイル (`manual/owner-draw-menu/`) | 対応状況 | 実装ソースコード (Rust / JS) |
| :--- | :--- | :---: | :--- |
| **`descript.txt`** (シェル設定) | [menu-colors.md](menu-colors.md) | ✅ 実装済 | [`commands/shell/mod.rs`](../../../../src-tauri/src/commands/shell/mod.rs) |
| **`readme.txt`** (説明書) | [menu-bitmaps.md](menu-bitmaps.md) | ✅ 実装済 | [`commands/file.rs`](../../../../src-tauri/src/commands/file.rs) |
| **`surface*.png`** (サーフィス画像) | [menu-bitmaps.md](menu-bitmaps.md) | ✅ 実装済 | [`commands/file.rs`](../../../../src-tauri/src/commands/file.rs), [`surface-compositor.js`](../../../../ui/js/surface/surface-compositor.js) |
| **`surface*.pna`** (サーフィスPNAマスク) | [menu-bitmaps.md](menu-bitmaps.md) | ✅ 実装済 | [`commands/file.rs`](../../../../src-tauri/src/commands/file.rs), [`surface-compositor.js`](../../../../ui/js/surface/surface-compositor.js) |
| **`(element).png`** (合成パーツ画像) | [menu-bitmaps.md](menu-bitmaps.md) | ✅ 実装済 | [`surface-load.js`](../../../../ui/js/surface/surface-load.js) |
| **`(element).pna`** (合成パーツPNA) | [menu-bitmaps.md](menu-bitmaps.md) | ✅ 実装済 | [`surface-load.js`](../../../../ui/js/surface/surface-load.js) |
| **`surfaces.txt`** (サーフィス定義) | [menu-fonts.md](menu-fonts.md) | ✅ 実装済 | [`parse_surfaces_text`](../../../../src-tauri/src/commands/shell/mod.rs) |
| **`surfaces**.txt`** (SSP専用定義) | [menu-fonts.md](menu-fonts.md) | ✅ 実装済 | [`parse_surfaces_text`](../../../../src-tauri/src/commands/shell/mod.rs) |
| **`alias.txt`** (旧仕様エイリアス) | [menu-fonts.md](menu-fonts.md) | ✅ 実装済 | [`parse_surfaces_text`](../../../../src-tauri/src/commands/shell/mod.rs) |
| **`thumbnail.png`** (シェルサムネイル) | [menu-bitmaps.md](menu-bitmaps.md) | ✅ 実装済 | [`scan/mod.rs`](../../../../src-tauri/src/ghost/scan/mod.rs) |
| **`makoto.dll`** (トランスレータ) | [README.md](README.md) | ✅ 実装済 | [`shiori/dynamic/`](../../../../src-tauri/src/shiori/dynamic/) |
| **`surfacetable.txt`** (SSP用定義) | [menu-fonts.md](menu-fonts.md) | ✅ 実装済 | [`surface-load.js`](../../../../ui/js/surface/surface-load.js) |
| **`menu_background.png`** (メニュー背景) | [menu-bitmaps.md](menu-bitmaps.md) | ✅ 実装済 | [`submenu-theme.js`](../../../../ui/js/ui/submenu-theme.js) |
| **`menu_foreground.png`** (メニューカーソル) | [menu-bitmaps.md](menu-bitmaps.md) | ✅ 実装済 | [`submenu-theme.js`](../../../../ui/js/ui/submenu-theme.js) |
| **`menu_sidebar.png`** (メニューサイドバー) | [menu-bitmaps.md](menu-bitmaps.md) | ✅ 実装済 | [`submenu-theme.js`](../../../../ui/js/ui/submenu-theme.js) |
