# delete.txt

- **規格**: [introduction_delete.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/delete.txt/introduction_delete.txt/) (ukadoc-spec/descript/install/delete.txt/introduction_delete.txt.md)
- **検索語**: delete.txt
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/commands/install/archive/postprocess.rs` (`process_delete_txt`), `crates/nanai-core/src/update_protocol/helpers.rs` (`parse_delete_txt`), および `src-tauri/src/commands/update/network/commands/execute.rs` において `delete.txt` のパース、文字コード判別 (`charset`)、ファイル・フォルダクリーンアップ処理が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/update_protocol/helpers.rs` (`parse_delete_txt`)
- `src-tauri/src/commands/install/archive/postprocess.rs` (`process_delete_txt`)
- `src-tauri/src/commands/update/network/commands/execute.rs` (`delete.txt`)
