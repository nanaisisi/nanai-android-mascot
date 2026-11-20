# .narignore / .updateignore / .narinclude / .updateinclude

- **規格**: [directory.md](../../../../ukadoc-spec/manual/directory.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/directory/))
- **検索語**: .narignore, .updateignore, .narinclude, .updateinclude
- **対応状況**: ✅ 実装済

## 突合結果

`PatternSet` / `IncludeFilter`（`src-tauri/src/ghost/scan/directory/package_files.rs`）が `.narignore` / `.narinclude` / `.updateignore` / `.updateinclude` を読み込む（glob `*` `?`、末尾 `/` でディレクトリ、`#` `//` コメント、include 指定時は不一致を除外）。`create_nar_from_directory` は `IncludeFilter::load_nar`、`generate_updates2_dau` は `IncludeFilter::load_update` を適用する。`should_skip_directory`（`filter.rs`）は誤ってこれら 4 ファイルでゴーストを走査除外していたため `.dev_ignore` のみに修正した。テスト: `patterns_match`、`include_filter_and_files`。
