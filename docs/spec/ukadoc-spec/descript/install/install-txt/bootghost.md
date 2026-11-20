# bootghost,ディレクトリ名

- **規格**: [bootghost.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/bootghost.md)
- **検索語**: bootghost
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/commands/install/archive/inspection/analyzer/zip_inspector.rs` および `types.rs` において `type,package` インストール時の `bootghost` ディレクティブのパースおよび自動起動指示処理が完全実装済み。

## 実装箇所

- `crates/ui/src/update/parser/install_manifest.rs:34` `let bootghost = map.get("bootghost").cloned();`
- `src-tauri/src/commands/install/archive/inspection/tests.rs:66` `map.insert("bootghost".to_string(), "master_ghost".to_string());`
- `crates/ui/src/update/parser/install_manifest.rs:138` `bootghost,`
- `src-tauri/src/commands/install/archive/inspection/tests.rs:78` `map.get("bootghost").map(|s| s.as_str()),`
- `crates/ui/src/update/tests/installer_manifest.rs:28` `bootghost,special_ghost\r\n\`
- `src-tauri/src/commands/install/archive/inspection/types.rs:48` `bootghost: Option<String>,`
