# update_result

- **規格**: [update_result.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/update_result/)
- **検索語**: update_result
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コード内に「update_result」を確認。

## 実装箇所

- `src-tauri/src/commands/install/archive/postprocess.rs:136` `update_result: Some("正常 (インストール済)".to_string()),`
- `src-tauri/src/commands/shell/ghost.rs:38` `update_result: None,`
- `src-tauri/src/common/models.rs:45` `pub update_result: Option<String>,`
- `src-tauri/src/ghost/scan/directory/mod.rs:73` `let update_result = if dau_path.exists() {`
- `src-tauri/src/ghost/scan/directory/mod.rs:96` `update_result,`
