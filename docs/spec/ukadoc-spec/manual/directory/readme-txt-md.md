# readme.txt または readme.md

- **規格**: [directory.md](../../../../ukadoc-spec/manual/directory.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/directory/))
- **検索語**: readme.txt
- **対応状況**: ⚠️ 一部対応

## 突合結果

`find_ghost_readme`（`package_files.rs`）が `readme.txt` 優先・無ければ `readme.md` を大文字小文字無視で解決し、Tauri コマンド `get_ghost_readme`（`commands/shell/ghost.rs`）およびシェル側の `get_shell_readme`（`commands/shell/manifest.rs`）で本文を取得でき、ゴースト一覧 UI（`ui/ts/ui/modal-ghost-handlers.ts`）の「README」「シェルREADME」ボタンからモーダルビューアで閲覧できる（テスト `include_filter_and_files` / `reads_readme_terms_and_thumbnail_from_ghost_dir`）。未対応: UI 側 `\![open,readme]`（`target.ts`）への接続、Markdown 装飾表示、インストール時自動表示。
