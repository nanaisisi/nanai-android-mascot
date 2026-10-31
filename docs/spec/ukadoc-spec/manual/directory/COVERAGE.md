# 全体の構成（ディレクトリ構成） 100%カバー対応表（ファイルツリー完全同期）

- **規格参照元**: [`docs/ukadoc-spec/manual/directory.md`](../../../../ukadoc-spec/manual/directory.md)
- **判定基準**: `docs/ukadoc-spec/manual/directory.md` のファイルツリー（全32項目）に記載されているすべてのファイル・フォルダ構成項目の実装および対応状況

## 対応表一覧

| ファイルツリー項目 (`manual/directory.md`) | 当リポジトリの監査ファイル (`manual/directory/`) | 対応状況 | 実装ソースコード (Rust / JS) |
| :--- | :--- | :---: | :--- |
| **`ghost/master/descript.txt`** | [ghost-folder.md](ghost-folder.md) | ✅ 実装済 | [`scan/mod.rs`](../../../../src-tauri/src/ghost/scan/mod.rs), [`shell_manifest`](../../../../src-tauri/src/commands/shell/mod.rs) |
| **`ghost/master/shiori.dll`** | [ghost-folder.md](ghost-folder.md) | ✅ 実装済 | [`shiori/dynamic/`](../../../../src-tauri/src/shiori/dynamic/) |
| **`ghost/master/makoto.dll`** | [ghost-folder.md](ghost-folder.md) | ✅ 実装済 | [`shiori/dynamic/`](../../../../src-tauri/src/shiori/dynamic/) |
| **`ghost/master/updates2.dau`** | [update-files.md](update-files.md) | ✅ 実装済 | [`update/network.rs`](../../../../src-tauri/src/commands/update/network.rs) |
| **`ghost/master/*.ico`** | [ghost-folder.md](ghost-folder.md) | ✅ 実装済 | [`commands/file.rs`](../../../../src-tauri/src/commands/file.rs) |
| **`ghost/master/*.cur`** | [ghost-folder.md](ghost-folder.md) | ✅ 実装済 | [`commands/file.rs`](../../../../src-tauri/src/commands/file.rs) |
| **`shell/master/descript.txt`** | [shell-folder.md](shell-folder.md) | ✅ 実装済 | [`shell_manifest`](../../../../src-tauri/src/commands/shell/mod.rs) |
| **`shell/master/surface*.png`** | [shell-folder.md](shell-folder.md) | ✅ 実装済 | [`commands/file.rs`](../../../../src-tauri/src/commands/file.rs), [`surface-compositor.js`](../../../../ui/js/surface/surface-compositor.js) |
| **`shell/master/surface*.pna`** | [shell-folder.md](shell-folder.md) | ✅ 実装済 | [`commands/file.rs`](../../../../src-tauri/src/commands/file.rs), [`surface-compositor.js`](../../../../ui/js/surface/surface-compositor.js) |
| **`shell/master/(element).png`** | [shell-folder.md](shell-folder.md) | ✅ 実装済 | [`surface-load.js`](../../../../ui/js/surface/surface-load.js) |
| **`shell/master/(element).pna`** | [shell-folder.md](shell-folder.md) | ✅ 実装済 | [`surface-load.js`](../../../../ui/js/surface/surface-load.js) |
| **`shell/master/surfaces.txt`** | [shell-folder.md](shell-folder.md) | ✅ 実装済 | [`parse_surfaces_text`](../../../../src-tauri/src/commands/shell/mod.rs) |
| **`shell/master/surfaces**.txt`** (SSP) | [shell-folder.md](shell-folder.md) | ✅ 実装済 | [`parse_surfaces_text`](../../../../src-tauri/src/commands/shell/mod.rs) |
| **`shell/master/alias.txt`** (旧仕様) | [shell-folder.md](shell-folder.md) | ✅ 実装済 | [`parse_surfaces_text`](../../../../src-tauri/src/commands/shell/mod.rs) |
| **`shell/master/thumbnail.png`** | [shell-folder.md](shell-folder.md) | ✅ 実装済 | [`scan/mod.rs`](../../../../src-tauri/src/ghost/scan/mod.rs) |
| **`shell/master/makoto.dll`** | [shell-folder.md](shell-folder.md) | ✅ 実装済 | [`shiori/dynamic/`](../../../../src-tauri/src/shiori/dynamic/) |
| **`shell/master/surfacetable.txt`** (SSP) | [shell-folder.md](shell-folder.md) | ✅ 実装済 | [`surface-load.js`](../../../../ui/js/surface/surface-load.js) |
| **`shell/master/menu_background.png`** | [shell-folder.md](shell-folder.md) | ✅ 実装済 | [`submenu.js`](../../../../ui/js/ui/submenu.js) |
| **`shell/master/menu_foreground.png`** | [shell-folder.md](shell-folder.md) | ✅ 実装済 | [`submenu.js`](../../../../ui/js/ui/submenu.js) |
| **`shell/master/menu_sidebar.png`** | [shell-folder.md](shell-folder.md) | ✅ 実装済 | [`submenu.js`](../../../../ui/js/ui/submenu.js) |
| **`shell/master/readme.txt`** | [shell-folder.md](shell-folder.md) | ✅ 実装済 | [`commands/file.rs`](../../../../src-tauri/src/commands/file.rs) |
| **`shell/(additional_shell)/`** | [shell-folder.md](shell-folder.md) | ✅ 実装済 | [`scan/mod.rs`](../../../../src-tauri/src/ghost/scan/mod.rs) |
| **`delete.txt`** | [install-files.md](install-files.md) | ✅ 実装済 | [`commands/install/`](../../../../src-tauri/src/commands/install/) |
| **`delete[数字].txt`** (`delete1.txt` 等) | [install-files.md](install-files.md) | ✅ 実装済 | [`commands/install/`](../../../../src-tauri/src/commands/install/) |
| **`developer_options.txt`** (SSP) | [install-files.md](install-files.md) | ✅ 実装済 | [`commands/install/`](../../../../src-tauri/src/commands/install/) |
| **`.narignore`** (SSP) | [ghost-folder.md](ghost-folder.md) | ✅ 実装済 | [`scan/mod.rs`](../../../../src-tauri/src/ghost/scan/mod.rs) |
| **`.updateignore`** (SSP) | [ghost-folder.md](ghost-folder.md) | ✅ 実装済 | [`scan/mod.rs`](../../../../src-tauri/src/ghost/scan/mod.rs) |
| **`.narinclude`** (SSP) | [ghost-folder.md](ghost-folder.md) | ✅ 実装済 | [`scan/mod.rs`](../../../../src-tauri/src/ghost/scan/mod.rs) |
| **`updateinclude`** (SSP) | [ghost-folder.md](ghost-folder.md) | ✅ 実装済 | [`scan/mod.rs`](../../../../src-tauri/src/ghost/scan/mod.rs) |
| **`readme.txt または readme.md`** | [install-files.md](install-files.md) | ✅ 実装済 | [`commands/file.rs`](../../../../src-tauri/src/commands/file.rs), [`scan/mod.rs`](../../../../src-tauri/src/ghost/scan/mod.rs) |
| **`terms.txt または terms.md`** | [install-files.md](install-files.md) | ✅ 実装済 | [`commands/install/`](../../../../src-tauri/src/commands/install/) |
| **`thumbnail.png`** (ゴーストールート) | [install-files.md](install-files.md) | ✅ 実装済 | [`scan/mod.rs`](../../../../src-tauri/src/ghost/scan/mod.rs) |
| **バルーンフォルダ全体 (`(myballoon)\\*`)** | [balloon-folder.md](balloon-folder.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
