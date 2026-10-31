# ゴースト仕様 100%カバー対応表（ファイルツリー完全同期）

- **規格参照元**: [`docs/ukadoc-spec/manual/ghost.md`](../../../../ukadoc-spec/manual/ghost.md)
- **判定基準**: `docs/ukadoc-spec/manual/ghost.md` のファイルツリー（masterゴーストフォルダ構成）に記載されているすべてのファイル・構成項目の実装および対応状況

## 対応表一覧

| ファイルツリー項目 (`manual/ghost.md`) | 当リポジトリの監査ファイル (`manual/ghost/`) | 対応状況 | 実装ソースコード (Rust / JS) |
| :--- | :--- | :---: | :--- |
| **`ghost/master/descript.txt`** | [ghost-structure.md](ghost-structure.md) | ✅ 実装済 | [`scan/mod.rs`](../../../../src-tauri/src/ghost/scan/mod.rs), [`shell_manifest`](../../../../src-tauri/src/commands/shell/mod.rs) |
| **`ghost/master/shiori.dll`** | [shiori-loading.md](shiori-loading.md) | ✅ 実装済 | [`shiori/dynamic/`](../../../../src-tauri/src/shiori/dynamic/), [`shiori-host`](../../../../crates/shiori/) |
| **`ghost/master/(saori).dll`** | [shiori-loading.md](shiori-loading.md) | ✅ 実装済 | [`shiori/dynamic/`](../../../../src-tauri/src/shiori/dynamic/) |
| **`ghost/master/makoto.dll`** | [shiori-loading.md](shiori-loading.md) | ✅ 実装済 | [`shiori/dynamic/`](../../../../src-tauri/src/shiori/dynamic/) |
| **`ghost/master/updates2.dau`** | [README.md](README.md) | ✅ 実装済 | [`update/network.rs`](../../../../src-tauri/src/commands/update/network.rs) |
| **`ghost/master/updates.txt`** | [README.md](README.md) | ✅ 実装済 | [`update/network.rs`](../../../../src-tauri/src/commands/update/network.rs) |
| **`ghost/master/*.ico`** | [ghost-structure.md](ghost-structure.md) | ✅ 実装済 | [`commands/file.rs`](../../../../src-tauri/src/commands/file.rs) |
| **`ghost/master/*.cur`** | [ghost-structure.md](ghost-structure.md) | ✅ 実装済 | [`commands/file.rs`](../../../../src-tauri/src/commands/file.rs) |
| **`ghost/master/thumbnail.png`** | [ghost-structure.md](ghost-structure.md) | ✅ 実装済 | [`scan/mod.rs`](../../../../src-tauri/src/ghost/scan/mod.rs) |
| **`ghost/master/ai0.png / ai0_dark.png`** | [ghost-structure.md](ghost-structure.md) | ✅ 実装済 | [`scan/mod.rs`](../../../../src-tauri/src/ghost/scan/mod.rs) |
