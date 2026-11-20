# 相対パス,オプション1,オプション2,...

- **規格**: [entry.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/developer_options.txt/entry/) (ukadoc-spec/descript/install/developer_options.txt/entry.md)
- **検索語**: 相対パス,オプション1,オプション2,...
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory/filter.rs` および `crates/nanai-core/src/update_protocol/helpers.rs` において `developer_options.txt` 内の「相対パス,オプション1,オプション2,...」（`noupdate`, `ignore` 等）の解釈および適用判定が完全実装済み。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/filter.rs` (`parse_developer_options`)
- `crates/nanai-core/src/update_protocol/helpers.rs` (`is_no_update_path`)
