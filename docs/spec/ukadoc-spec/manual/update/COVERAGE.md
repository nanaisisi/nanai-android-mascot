# ネットワーク更新仕様 100%カバー対応表

- **規格参照元**: [`docs/ukadoc-spec/manual/update.md`](../../../../ukadoc-spec/manual/update.md)
- **判定基準**: `docs/ukadoc-spec/manual/update.md` に記載されている `updates2.dau`, `updates.txt`, およびネットワーク自動更新の実装状況

| 項目 (`manual/update.md`) | 当リポジトリの監査ファイル (`manual/update/`) | 対応状況 | 実装ソースコード (Rust / JS) |
| :--- | :--- | :---: | :--- |
| **`updates2.dau` / `updates.txt` 解析** | [updates2-dau.md](updates2-dau.md) | ✅ 実装済 | [`update/network.rs`](../../../../src-tauri/src/commands/update/network.rs) |
| **ネットワーク更新実行 (`check_ghost_update`)** | [network-update.md](network-update.md) | ✅ 実装済 | [`update/network.rs`](../../../../src-tauri/src/commands/update/network.rs) |
