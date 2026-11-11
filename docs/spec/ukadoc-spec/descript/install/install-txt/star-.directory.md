# *.directory,ディレクトリ名

- **規格**: [star-.directory.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/star-.directory.md)
- **検索語**: *.directory
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `*.directory`（`ghost.directory`, `balloon.directory` 等）をパースし、個別サブコンポーネントの解凍先ディレクトリへ設定する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive/inspection/tests.rs:9` `map.insert("balloon.directory".to_string(), "balloon_main".to_string());`
- `src-tauri/src/commands/install/archive/inspection/tests.rs:15` `map.insert("balloon0.directory".to_string(), "balloon_zero".to_string());`
- `src-tauri/src/commands/install/archive/inspection/tests.rs:17` `"balloon0.source.directory".to_string(),`
- `src-tauri/src/commands/install/archive/inspection/tests.rs:20` `map.insert("balloon1.directory".to_string(), "balloon_one".to_string());`
- `src-tauri/src/commands/install/archive/inspection/tests.rs:22` `"balloon3.directory".to_string(),`
