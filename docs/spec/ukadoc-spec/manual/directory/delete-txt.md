# delete.txt / delete1.txt

- **規格**: [directory.md](../../../../ukadoc-spec/manual/directory.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/directory/))
- **検索語**: process_delete_txt
- **対応状況**: ⚠️ 一部対応

## 突合結果

`docs/ukadoc-spec/manual/directory.md` の `(myghost)/delete.txt` および `delete1.txt`（`delete[数字].txt`）について、`process_delete_txt` がアーカイブ展開後（`extract_ghost_archive_from_reader`）およびネットワーク更新後（`execute_ghost_update`）にルート直下の `delete.txt` を読み込み、ディレクトリトラバーサル検証付きで対象ファイル・ディレクトリを削除する。`crates/nanai-core` には `parse_delete_txt` もあるが、実削除処理は `"delete.txt"` 固定であり、`delete1.txt` 等の番号付きファイルやバルーン側 `delete.txt` 処理には未対応。

## 実装箇所

- `src-tauri/src/commands/install/archive/postprocess.rs:55` `pub fn process_delete_txt(target_dir: &Path) {`
- `src-tauri/src/commands/install/archive/mod.rs:75` `process_delete_txt(&target_dir);`
- `src-tauri/src/commands/update/network/commands/execute.rs:162` `crate::commands::install::archive::process_delete_txt(&ghost_dir);`
- `crates/nanai-core/src/update_protocol/helpers.rs:70` `pub fn parse_delete_txt(content: &str) -> DeleteTxtManifest {`
- `crates/nanai-core/src/update_protocol/tests.rs:40` `fn test_parse_delete_and_developer_options() {`
