# terms.txt または terms.md

- **規格**: [directory.md](../../../../ukadoc-spec/manual/directory.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/directory/))
- **検索語**: terms.txt, terms.md
- **対応状況**: ⚠️ 一部対応

## 突合結果

`find_ghost_terms` / `read_ghost_terms`（`package_files.rs`）が `terms.txt` / `terms.md` を外部ファイルから読み込み、Tauri コマンド `get_ghost_terms`（`commands/shell/ghost.rs`）で本文を取得できる（テスト `reads_readme_terms_and_thumbnail_from_ghost_dir`）。未対応: インストール前の同意ダイアログ接続と、拒否時のインストール中断（`modal-dialog-system.ts` の `terms` 枠との配線が未実装）。

