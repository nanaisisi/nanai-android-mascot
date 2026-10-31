# ネットワーク更新仕様 100%カバー対応表（ファイルツリー完全同期）

- **規格参照元**: [`docs/ukadoc-spec/manual/update.md`](../../../../ukadoc-spec/manual/update.md)
- **判定基準**: `docs/ukadoc-spec/manual/update.md` のファイルツリー（ゴースト・シェル・バルーンのネットワーク更新ファイル構成）に記載されているすべてのファイル・構成項目の実装および対応状況

## 対応表一覧

| ファイルツリー項目 (`manual/update.md`) | 当リポジトリの監査ファイル (`manual/update/`) | 対応状況 | 実装ソースコード (Rust / JS) |
| :--- | :--- | :---: | :--- |
| **`updates2.dau`** (更新インデックス) | [updates2-dau.md](updates2-dau.md) | ✅ 実装済 | [`update/network.rs`](../../../../src-tauri/src/commands/update/network.rs) |
| **`updates.txt`** (更新インデックス旧仕様) | [updates2-dau.md](updates2-dau.md) | ✅ 実装済 | [`update/network.rs`](../../../../src-tauri/src/commands/update/network.rs) |
| **`delete.txt / delete[数字].txt`** (削除指定) | [network-update.md](network-update.md) | ✅ 実装済 | [`archive/postprocess.rs`](../../../../src-tauri/src/commands/install/archive/postprocess.rs) (`process_delete_txt`) |
| **`developer_options.txt`** (開発者設定) | [README.md](README.md) | ✅ 実装済 | [`commands/install/`](../../../../src-tauri/src/commands/install/) |
| **`readme.txt` / `thumbnail.png`** | [README.md](README.md) | ✅ 実装済 | [`commands/file.rs`](../../../../src-tauri/src/commands/file.rs), [`scan/mod.rs`](../../../../src-tauri/src/ghost/scan/mod.rs) |
