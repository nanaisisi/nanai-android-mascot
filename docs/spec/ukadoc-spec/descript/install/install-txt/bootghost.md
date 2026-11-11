# bootghost,ディレクトリ名

- **規格**: [bootghost.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/bootghost.md)
- **検索語**: bootghost
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `bootghost` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive/inspection/tests.rs:64` `map.insert("bootghost".to_string(), "master_ghost".to_string());`
- `src-tauri/src/commands/install/archive/inspection/tests.rs:76` `map.get("bootghost").map(|s| s.as_str()),`
- `src-tauri/src/commands/install/archive/inspection/types.rs:18` `pub bootghost: Option<String>,`
- `src-tauri/src/commands/install/archive/inspection/analyzer/zip_inspector.rs:44` `let mut bootghost: Option<String> = None;`
- `src-tauri/src/commands/install/archive/inspection/analyzer/zip_inspector.rs:70` `if let Some(val) = map.get("bootghost") {`
