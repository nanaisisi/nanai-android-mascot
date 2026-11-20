# (myghost)/thumbnail.png

- **規格**: [directory.md](../../../../ukadoc-spec/manual/directory.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/directory/))
- **検索語**: thumbnail.pnr
- **対応状況**: ⚠️ 一部対応

## 突合結果

`find_ghost_thumbnail`（`package_files.rs`）および `discover_ghost_assets`（`assets.rs`）が `thumbnail.png` / `thumbnail.jpg` / `thumbnail.jpeg` / `thumbnail.pnr` を解決し、`.pnr` の左上 1px 透過処理（`apply_top_left_transparency` / `load_ghost_thumbnail_data_url`）を含めて Tauri コマンド `get_ghost_thumbnail`（`commands/shell/ghost.rs`、`resolve_ghost_thumbnail_data_url_from_dir`）から Data URL として取得できる（テスト `reads_readme_terms_and_thumbnail_from_ghost_dir` / `pnr_thumbnail_applies_top_left_transparency` / `resolves_pnr_thumbnail_data_url_with_top_left_transparency`）。未対応: `GhostInfo` への項目追加と `renderGhostList` での表示。

