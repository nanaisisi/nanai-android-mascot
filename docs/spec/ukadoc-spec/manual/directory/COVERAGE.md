# 全体の構成（ディレクトリ構成） 100%カバー対応表（ファイルツリー完全同期）

- **規格参照元**: [`docs/ukadoc-spec/manual/directory.md`](../../../../ukadoc-spec/manual/directory.md)
- **判定基準**: `docs/ukadoc-spec/manual/directory.md` のファイルツリー（ゴースト・シェル・バルーン・共通設定ファイル）に記載されているすべてのファイル・フォルダ構成項目の実装および対応状況

## 対応表一覧

| ファイルツリー項目 (`manual/directory.md`) | 当リポジトリの監査ファイル (`manual/directory/`) | 対応状況 | 実装ソースコード (Rust / JS) |
| :--- | :--- | :---: | :--- |
| **`(myghost)\\ghost\\master\\descript.txt`** | [ghost-folder.md](ghost-folder.md) | ✅ 実装済 | [`scan/mod.rs`](../../../../src-tauri/src/ghost/scan/mod.rs), [`shell_manifest`](../../../../src-tauri/src/commands/shell/mod.rs) |
| **`(myghost)\\ghost\\master\\shiori.dll`** | [ghost-folder.md](ghost-folder.md) | ✅ 実装済 | [`shiori/dynamic/`](../../../../src-tauri/src/shiori/dynamic/) |
| **`(myghost)\\ghost\\master\\makoto.dll`** | [ghost-folder.md](ghost-folder.md) | ✅ 実装済 | [`shiori/dynamic/`](../../../../src-tauri/src/shiori/dynamic/) |
| **`(myghost)\\ghost\\master\\updates2.dau`** | [update-files.md](update-files.md) | ✅ 実装済 | [`update/network.rs`](../../../../src-tauri/src/commands/update/network.rs) |
| **`(myghost)\\ghost\\master\\*.ico / *.cur`** | [ghost-folder.md](ghost-folder.md) | ✅ 実装済 | [`commands/file.rs`](../../../../src-tauri/src/commands/file.rs) |
| **`(myghost)\\shell\\master\\descript.txt`** | [shell-folder.md](shell-folder.md) | ✅ 実装済 | [`shell_manifest`](../../../../src-tauri/src/commands/shell/mod.rs) |
| **`(myghost)\\shell\\master\\surface*.png`** | [shell-folder.md](shell-folder.md) | ✅ 実装済 | [`commands/file.rs`](../../../../src-tauri/src/commands/file.rs), [`surface-compositor.js`](../../../../ui/js/surface/surface-compositor.js) |
| **`(myghost)\\shell\\master\\surface*.pna`** | [shell-folder.md](shell-folder.md) | ✅ 実装済 | [`commands/file.rs`](../../../../src-tauri/src/commands/file.rs), [`surface-compositor.js`](../../../../ui/js/surface/surface-compositor.js) |
| **`(myghost)\\shell\\master\\(element).*`** | [shell-folder.md](shell-folder.md) | ✅ 実装済 | [`surface-load.js`](../../../../ui/js/surface/surface-load.js) |
| **`surfaces.txt / surfaces**.txt`** | [shell-folder.md](shell-folder.md) | ✅ 実装済 | [`parse_surfaces_text`](../../../../src-tauri/src/commands/shell/mod.rs) |
| **`menu_background.png / foreground / sidebar`** | [shell-folder.md](shell-folder.md) | ✅ 実装済 | [`submenu.js`](../../../../ui/js/ui/submenu.js) |
| **`(myballoon)\\*`** (バルーンファイル群) | [balloon-folder.md](balloon-folder.md) | ✅ 実装済 | [`balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs), [`balloon-window.js`](../../../../ui/js/ghost/balloon-window.js) |
| **`delete.txt / delete[数字].txt`** | [install-files.md](install-files.md) | ✅ 実装済 | [`commands/install/`](../../../../src-tauri/src/commands/install/) |
| **`developer_options.txt`** | [install-files.md](install-files.md) | ✅ 実装済 | [`commands/install/`](../../../../src-tauri/src/commands/install/) |
| **`.narignore / .updateignore`** | [ghost-folder.md](ghost-folder.md) | ✅ 実装済 | [`scan/mod.rs`](../../../../src-tauri/src/ghost/scan/mod.rs) |
| **`readme.txt / terms.txt / thumbnail.png`** | [install-files.md](install-files.md) | ✅ 実装済 | [`commands/file.rs`](../../../../src-tauri/src/commands/file.rs), [`scan/mod.rs`](../../../../src-tauri/src/ghost/scan/mod.rs) |
