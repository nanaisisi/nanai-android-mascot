# developer_options.txt

- **規格**: [introduction_developeroptions.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/developer_options.txt/introduction_developeroptions.txt/) (ukadoc-spec/descript/install/developer_options.txt/introduction_developeroptions.txt.md)
- **検索語**: developer_options.txt
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory/filter.rs`, `crates/nanai-core/src/update_protocol/helpers.rs` (`is_no_update_path`), および `src-tauri/src/commands/update/generation.rs` において `developer_options.txt` のパースおよび開発者向け除外・制御フラグの適用が完全実装済み。

## 実装箇所

- `src-tauri/src/ghost/scan/directory/filter.rs` (`parse_developer_options`)
- `crates/nanai-core/src/update_protocol/helpers.rs` (`is_no_update_path`)
- `src-tauri/src/commands/update/generation.rs` (`developer_options.txt`)
