# (myghost)/thumbnail.png

- **規格**: [directory.md](../../../../ukadoc-spec/manual/directory.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/directory/))
- **検索語**: thumbnail.pnr
- **対応状況**: ⚠️ 一部対応

## 突合結果

`find_ghost_thumbnail`（`package_files.rs`）および `discover_ghost_assets`（`assets.rs`）が `thumbnail.png` / `thumbnail.jpg` / `thumbnail.jpeg` / `thumbnail.pnr` を解決し、Tauri コマンド `get_ghost_thumbnail`（`commands/shell/ghost.rs`）でパスを取得できる（テスト `reads_readme_terms_and_thumbnail_from_ghost_dir`）。未対応: `GhostInfo` への項目追加と `renderGhostList` での表示、`.pnr` の左上 1px 透過処理。

