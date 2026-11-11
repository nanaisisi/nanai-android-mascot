# group,グループ名

- **規格**: [group.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/group/) (ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/group.md)
- **検索語**: group
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コードに「group」が見つからない。

## 実装箇所

- `src-tauri/src/commands/install/archive/postprocess.rs:107` `let group = meta_map.as_ref().and_then(|m| m.get("group").cloned());`
- `src-tauri/src/commands/install/archive/postprocess.rs:133` `group,`
- `src-tauri/src/commands/shell/ghost.rs:35` `group: manifest.group,`
- `src-tauri/src/common/models.rs:42` `pub group: Option<String>,`
- `src-tauri/src/ghost/scan/directory/manifest.rs:15` `pub group: Option<String>,`
