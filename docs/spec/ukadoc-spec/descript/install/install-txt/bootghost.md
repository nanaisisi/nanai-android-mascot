# bootghost,ディレクトリ名

- **規格**: [bootghost.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/install-txt/) (ukadoc-spec/descript/install/install-txt/bootghost.md)
- **検索語**: bootghost
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/commands/install/archive.rs` において `bootghost` キーをパース・参照する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive/inspection.rs:23` `pub bootghost: Option<String>,`
- `src-tauri/src/commands/install/archive/inspection.rs:146` `let mut bootghost: Option<String> = None;`
- `src-tauri/src/commands/install/archive/inspection.rs:172` `if let Some(val) = map.get("bootghost") {`
- `src-tauri/src/commands/install/archive/inspection.rs:173` `bootghost = Some(val.clone());`
- `src-tauri/src/commands/install/archive/inspection.rs:280` `bootghost,`
