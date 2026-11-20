# developer_options.txt

- **規格**: [directory.md](../../../../ukadoc-spec/manual/directory.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/directory/))
- **検索語**: developer_options.txt
- **対応状況**: ✅ 実装済

## 突合結果

`generate_updates2_dau` が `noupdate=` を、`create_nar_from_directory` / `load_nonar_exclusions`（`src-tauri/src/commands/install/archive/packaging.rs`）が `nonar` 指定を `developer_options.txt` から動的に読み込んで適用する（テスト `test_create_nar_respects_developer_options_nonar`）。
