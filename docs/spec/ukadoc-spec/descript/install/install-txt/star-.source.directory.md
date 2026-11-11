# *.source.directory,ディレクトリ名

- **規格**: [star-.source.directory.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/star-.source.directory.md)
- **検索語**: *.source.directory
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `*.source.directory`（`balloon.source.directory` 等）をパースし、アーカイブ内ソースフォルダを特定する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive/inspection/tests.rs:17` `"balloon0.source.directory".to_string(),`
- `crates/ui/src/update/tests/installer_manifest.rs:35` `shell0.source.directory,custom_shell\r\n";`
