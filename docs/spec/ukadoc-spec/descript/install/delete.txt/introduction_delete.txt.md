# delete.txt

- **規格**: [introduction_delete.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/delete.txt/introduction_delete.txt/) (ukadoc-spec/descript/install/delete.txt/introduction_delete.txt.md)
- **検索語**: delete.txt
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/commands/install/archive/postprocess.rs` (`process_delete_txt`), `crates/nanai-core/src/update_protocol/helpers.rs` (`parse_delete_txt`), および `src-tauri/src/commands/update/network/commands/execute.rs` において `delete.txt` のパース、文字コード判別 (`charset`)、ファイル・フォルダクリーンアップ処理が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/update_protocol/helpers.rs:69` `/// delete.txt テキストをパース (UKADOC仕様)`
- `src-tauri/src/commands/install/archive/postprocess.rs:56` `let mut names = vec!["delete.txt".to_string()];`
- `ui/ts/core/wasm/pkg/nanai_core.d.ts:26` `* delete.txt のパース結果（削除対象ファイルパターン一覧）`
- `crates/nanai-core/src/update_protocol/types.rs:54` `/// delete.txt のパース結果（削除対象ファイルパターン一覧）`
- `src-tauri/src/commands/update/network/commands/execute.rs:147` `// 更新後に delete.txt / delete1.txt が存在する場合、旧ファイルのクリーンアップ処理を実行`
- `crates/nanai-core/ui/ts/core/wasm/pkg/nanai_core.d.ts:26` `* delete.txt のパース結果（削除対象ファイルパターン一覧）`
