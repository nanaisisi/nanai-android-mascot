# *.source.directory,ディレクトリ名

- **規格**: [star-.source.directory.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/star-.source.directory.md)
- **検索語**: *.source.directory
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `*.source.directory`（`balloon.source.directory` 等）をパースし、アーカイブ内ソースフォルダを特定する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive/inspection.rs:305` `"balloon0.source.directory".to_string(),`
- `crates/ui/src/update.rs:483` `shell0.source.directory,custom_shell\r\n";`
