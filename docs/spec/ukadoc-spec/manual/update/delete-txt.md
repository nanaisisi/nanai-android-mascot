# delete.txt / delete1.txt

- **規格**: [update.md](../../../../ukadoc-spec/manual/update.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/update/))
- **検索語**: delete.txt, parse_delete_txt, process_delete_txt
- **対応状況**: ⚠️ 一部対応

## 突合結果

ネットワーク更新完了後およびアーカイブ展開後に、対象ディレクトリ直下の `delete.txt` を読み取って記載されたファイル・ディレクトリを削除する処理を実装している（`src-tauri/src/commands/install/archive/postprocess.rs:55-75` の `process_delete_txt`、`src-tauri/src/commands/update/network/commands/execute.rs:162`、`src-tauri/src/commands/install/archive/mod.rs:75`）。また `crates/nanai-core/src/update_protocol/helpers.rs:70-80,140-143` が `parse_delete_txt` / `wasm_parse_delete_txt` を提供し、`ui/ts/core/wasm/wasm-protocol.ts:276-286`（`parseDeleteTxtWasm`）・`crates/nanai-core/src/update_protocol/tests.rs:40-46`・`tests/wasm-bridge.test.ts:60` で検証されている。一方で、サーバ上の `updates2.dau` と同じ位置から `delete.txt` を自動ダウンロードする処理、および SSP 独自の `delete1.txt` 等 `delete[数字].txt` 連番ファイルの認識は未実装。

## 実装箇所

- `src-tauri/src/commands/install/archive/postprocess.rs:55` `pub fn process_delete_txt(target_dir: &Path) {`
- `src-tauri/src/commands/update/network/commands/execute.rs:162` `crate::commands::install::archive::process_delete_txt(&ghost_dir);`
- `src-tauri/src/commands/install/archive/mod.rs:75` `process_delete_txt(&target_dir);`
- `crates/nanai-core/src/update_protocol/helpers.rs:70` `pub fn parse_delete_txt(content: &str) -> DeleteTxtManifest {`
- `ui/ts/core/wasm/wasm-protocol.ts:276` `export function parseDeleteTxtWasm(content: string): DeleteTxtManifest | null {`
- `crates/nanai-core/src/update_protocol/tests.rs:40` `fn test_parse_delete_and_developer_options() {`
- `tests/wasm-bridge.test.ts:60` `expect(wasmBridge.parseDeleteTxt("delete,file1.txt")).toBeDefined();`
