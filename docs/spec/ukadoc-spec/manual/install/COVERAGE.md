# インストール仕様 100%カバー対応表（ファイルツリー・構造完全同期）

- **規格参照元**: [`docs/ukadoc-spec/manual/install.md`](../../../../ukadoc-spec/manual/install.md)
- **判定基準**: `docs/ukadoc-spec/manual/install.md` のファイルツリーおよびインストール定義（NAR/ZIP、install.txt、同梱物、複数インストールパッケージ）に記載されているすべての項目の実装および対応状況

## 対応表一覧

| 項目・ファイル構造 (`manual/install.md`) | 当リポジトリの監査ファイル (`manual/install/`) | 対応状況 | 実装ソースコード (Rust / JS) |
| :--- | :--- | :---: | :--- |
| **標準的なゴースト** (`ghost/`, `shell/`, `install.txt`) | [nar-install.md](nar-install.md) | ✅ 実装済 | [`commands/install/`](../../../../src-tauri/src/commands/install/) |
| **サプリメント** (`supplement` 構造) | [install-txt.md](install-txt.md) | ✅ 実装済 | [`commands/install/`](../../../../src-tauri/src/commands/install/) |
| **追加シェル** (`additional_shell` 構造) | [install-txt.md](install-txt.md) | ✅ 実装済 | [`commands/install/`](../../../../src-tauri/src/commands/install/) |
| **バルーン** (`myballoon` 構造) | [nar-install.md](nar-install.md) | ✅ 実装済 | [`commands/install/`](../../../../src-tauri/src/commands/install/) |
| **ゴーストへのバルーン等同梱** | [nar-install.md](nar-install.md) | ✅ 実装済 | [`commands/install/`](../../../../src-tauri/src/commands/install/) |
| **複数インストールパッケージ** (マルチNAR) | [nar-install.md](nar-install.md) | ✅ 実装済 | [`commands/install/`](../../../../src-tauri/src/commands/install/) |
| **`install.txt`** (インストール設定) | [install-txt.md](install-txt.md) | ✅ 実装済 | [`commands/install/`](../../../../src-tauri/src/commands/install/) |
| **`developer_options.txt`** (開発者設定) | [nar-install.md](nar-install.md) | ✅ 実装済 | [`commands/install/`](../../../../src-tauri/src/commands/install/) |
| **アンインストール** (`uninstall_ghost`) | [uninstall.md](uninstall.md) | ✅ 実装済 | [`commands/shell/balloon.rs`](../../../../src-tauri/src/commands/shell/balloon.rs) |
| **ネットワーク更新** (`updates2.dau`) | [update-install.md](update-install.md) | ✅ 実装済 | [`update/network.rs`](../../../../src-tauri/src/commands/update/network.rs) |
