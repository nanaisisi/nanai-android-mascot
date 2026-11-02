# *.directory,ディレクトリ名

- **規格**: [star-.directory.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/star-.directory.md)
- **検索語**: *.directory
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `*.directory`（`ghost.directory`, `balloon.directory` 等）をパースし、個別サブコンポーネントの解凍先ディレクトリへ設定する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive/inspection.rs:45` `// 1. 無印 (例: balloon.directory, balloon.refresh, balloon.refreshundeletemask)`
- `src-tauri/src/commands/install/archive/inspection.rs:48` `let src_key = format!("{r_type}.source.directory");`
- `src-tauri/src/commands/install/archive/inspection.rs:77` `let src_key = format!("{r_type}{idx}.source.directory");`
- `src-tauri/src/commands/install/archive/inspection.rs:297` `map.insert("balloon.directory".to_string(), "balloon_main".to_string());`
- `src-tauri/src/commands/install/archive/inspection.rs:303` `map.insert("balloon0.directory".to_string(), "balloon_zero".to_string());`
