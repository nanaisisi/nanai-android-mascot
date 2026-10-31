# update_result

- **規格**: [update_result.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/update_result/)
- **検索語**: update_result
- **対応状況**: ✅ 実装済

## 突合結果

実装コード内に「update_result」を確認。

## 実装箇所

- `src-tauri/src/commands/install/archive.rs:332` `update_result: Some("正常 (インストール済)".to_string()),`
- `src-tauri/src/common/models.rs:43` `pub update_result: Option<String>,`
- `src-tauri/src/ghost/scan/directory.rs:237` `let update_result = if dau_path.exists() {`
- `src-tauri/src/ghost/scan/directory.rs:259` `update_result,`
- `src-tauri/src/ghost/scan/directory.rs:295` `update_result: Some("OK(0)".to_string()),`
