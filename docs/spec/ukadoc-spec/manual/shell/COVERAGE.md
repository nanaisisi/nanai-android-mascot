# シェル仕様 100%カバー対応表（ファイルツリー完全同期）

- **規格参照元**: [`docs/ukadoc-spec/manual/shell.md`](../../../../ukadoc-spec/manual/shell.md)
- **判定基準**: `docs/ukadoc-spec/manual/shell.md` のファイルツリー（masterシェルフォルダ構成）に記載されているすべてのファイル・構成項目の実装および対応状況

## 対応表一覧

| ファイルツリー項目 (`manual/shell.md`) | 当リポジトリの監査ファイル (`manual/shell/`) | 対応状況 | 実装ソースコード (Rust / JS) |
| :--- | :--- | :---: | :--- |
| **`shell/master/descript.txt`** | [shell-descript.md](shell-descript.md) | ✅ 実装済 | [`commands/shell/mod.rs`](../../../../src-tauri/src/commands/shell/mod.rs) |
| **`shell/master/surface*.png`** | [surface-png.md](surface-png.md) | ✅ 実装済 | [`commands/file.rs`](../../../../src-tauri/src/commands/file.rs), [`surface-compositor.js`](../../../../ui/js/surface/surface-compositor.js) |
| **`shell/master/surface*.pna`** | [surface-pna.md](surface-pna.md) | ✅ 実装済 | [`commands/file.rs`](../../../../src-tauri/src/commands/file.rs), [`surface-compositor.js`](../../../../ui/js/surface/surface-compositor.js) |
| **`shell/master/(element).png`** | [surface-png.md](surface-png.md) | ✅ 実装済 | [`surface-load.js`](../../../../ui/js/surface/surface-load.js) |
| **`shell/master/(element).pna`** | [surface-pna.md](surface-pna.md) | ✅ 実装済 | [`surface-load.js`](../../../../ui/js/surface/surface-load.js) |
| **`shell/master/surfaces.txt`** | [surfaces-txt.md](surfaces-txt.md) | ✅ 実装済 | [`parse_surfaces_text`](../../../../src-tauri/src/commands/shell/mod.rs) |
| **`shell/master/surfaces**.txt`** (SSP) | [surfaces-txt.md](surfaces-txt.md) | ✅ 実装済 | [`parse_surfaces_text`](../../../../src-tauri/src/commands/shell/mod.rs) |
| **`shell/master/thumbnail.png`** | [README.md](README.md) | ✅ 実装済 | [`scan/mod.rs`](../../../../src-tauri/src/ghost/scan/mod.rs) |
| **`shell/master/makoto.dll`** | [README.md](README.md) | ✅ 実装済 | [`shiori/dynamic/`](../../../../src-tauri/src/shiori/dynamic/) |
| **`shell/master/menu_background.png`** | [README.md](README.md) | ✅ 実装済 | [`submenu.js`](../../../../ui/js/ui/submenu.js) |
| **`shell/master/menu_foreground.png`** | [README.md](README.md) | ✅ 実装済 | [`submenu.js`](../../../../ui/js/ui/submenu.js) |
| **`shell/master/menu_sidebar.png`** | [README.md](README.md) | ✅ 実装済 | [`submenu.js`](../../../../ui/js/ui/submenu.js) |
