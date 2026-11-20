# update_result

- **規格**: [update_result.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/update_result/)
- **検索語**: update_result
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コード内に「update_result」を確認。

## 実装箇所

- `src-tauri/src/commands/install/archive/postprocess.rs:153` `update_result: Some("正常 (インストール済)".to_string()),`
- `ui/ts/ui/modal-explorer.ts:15` `update_result?: string;`
- `src-tauri/src/commands/shell/ghost.rs:39` `update_result: None,`
- `ui/ts/ui/modal-explorer.ts:90` `ghost.update_result,`
- `src-tauri/src/common/models/ghost.rs:24` `pub(crate) update_result: Option<String>,`
- `ui/ts/ui/templates/ghost-templates.ts:18` `<th data-sort="update_result">更新結果</th><th data-sort="sakura_name">¥0名</th><th d`
