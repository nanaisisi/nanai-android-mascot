# *.source.directory,ディレクトリ名

- **規格**: [star-.source.directory.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/star-.source.directory.md)
- **検索語**: *.source.directory
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs` において `*.source.directory`（`balloon.source.directory`, `shell0.source.directory` 等）の解析およびアーカイブ内ソースディレクトリ特定処理が完全実装済み。

## 実装箇所

- `crates/ui/src/update/tests/installer_manifest.rs:35` `shell0.source.directory,custom_shell\r\n";`
- `src-tauri/src/commands/install/archive/inspection/tests.rs:19` `"balloon0.source.directory".to_string(),`
