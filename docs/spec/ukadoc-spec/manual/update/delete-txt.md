# delete.txt / delete1.txt

- **規格**: [update.md](../../../../ukadoc-spec/manual/update.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/update/))
- **検索語**: delete.txt, parse_delete_txt, process_delete_txt
- **対応状況**: ✅ 実装済

## 突合結果

ネットワーク更新完了後およびアーカイブ展開後に、対象ディレクトリ直下の `delete.txt` および `delete1.txt` を読み取って記載されたファイル・ディレクトリを削除する処理を実装している（`src-tauri/src/commands/install/archive/postprocess.rs:55-75` の `process_delete_txt`、`src-tauri/src/commands/update/network/commands/execute.rs:146-147`、`src-tauri/src/commands/install/archive/mod.rs:75`）。また `crates/nanai-core/src/update_protocol/helpers.rs:70-80,140-143` が `parse_delete_txt` / `wasm_parse_delete_txt` を提供し、`ui/ts/core/wasm/wasm-protocol.ts:276-286`（`parseDeleteTxtWasm`）・`crates/nanai-core/src/update_protocol/tests.rs:40-46`・`tests/wasm-bridge.test.ts:60` で検証されている。`delete1.txt` の処理は `src-tauri/src/commands/install/archive/postprocess.rs:183` の `test_process_delete1_txt` でもテストされている。

## 実装箇所

- `src-tauri/src/commands/install/archive/postprocess.rs:55-56` `pub fn process_delete_txt(target_dir: &Path) {` / `for filename in ["delete.txt", "delete1.txt"] {`
- `src-tauri/src/commands/install/archive/postprocess.rs:183` `std::fs::write(temp_dir.join("delete1.txt"), "// comment\nold.txt\n").unwrap();`
- `src-tauri/src/commands/update/network/commands/execute.rs:146-147` `crate::commands::install::archive::process_delete_txt(target_dir);`
- `src-tauri/src/commands/install/archive/mod.rs:75` `process_delete_txt(&target_dir);`
- `crates/nanai-core/src/update_protocol/helpers.rs:70` `pub fn parse_delete_txt(content: &str) -> DeleteTxtManifest {`
- `ui/ts/core/wasm/wasm-protocol.ts:276` `export function parseDeleteTxtWasm(content: string): DeleteTxtManifest | null {`
- `crates/nanai-core/src/update_protocol/tests.rs:40` `fn test_parse_delete_and_developer_options() {`
- `tests/wasm-bridge.test.ts:60` `expect(wasmBridge.parseDeleteTxt("delete,file1.txt")).toBeDefined();`
