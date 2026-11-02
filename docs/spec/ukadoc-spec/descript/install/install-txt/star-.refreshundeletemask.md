# *.refreshundeletemask,ファイル名1:ファイル名2...

- **規格**: [star-.refreshundeletemask.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/star-.refreshundeletemask.md)
- **検索語**: *.refreshundeletemask
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `*.refreshundeletemask`（`ghost.refreshundeletemask` 等）をパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive/inspection.rs:45` `// 1. 無印 (例: balloon.directory, balloon.refresh, balloon.refreshundeletemask)`
- `src-tauri/src/commands/install/archive/inspection.rs:300` `"balloon.refreshundeletemask".to_string(),`
- `crates/ui/src/update.rs:481` `balloon.refreshundeletemask,balloon_pref.txt\r\n\`
