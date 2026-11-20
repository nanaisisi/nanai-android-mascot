# delete.txt / delete1.txt

- **規格**: [directory.md](../../../../ukadoc-spec/manual/directory.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/directory/))
- **検索語**: process_delete_txt
- **対応状況**: ✅ 実装済

## 突合結果

`process_delete_txt`（`src-tauri/src/commands/install/archive/postprocess.rs`）が `delete.txt` と `delete[数字].txt` を数字昇順で全て読み込み、ディレクトリトラバーサル検証付きで削除する。展開後（`extract_ghost_archive_from_reader`）とネットワーク更新後（`execute_ghost_update`）から呼ばれる。
