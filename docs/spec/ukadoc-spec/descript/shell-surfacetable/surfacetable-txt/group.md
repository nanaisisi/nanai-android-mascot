# group,グループ名

- **規格**: [group.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/group/) (ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/group.md)
- **検索語**: group
- **対応状況**: ✅ 対応済 (surfacetable.rs)

## 突合結果

実装コードに「group」が見つからない。


## 実装箇所

- `src-tauri/src/commands/install/archive.rs:244` `let group = meta_map.as_ref().and_then(|m| m.get("group").cloned());`
- `src-tauri/src/commands/install/archive.rs:259` `group,`
- `src-tauri/src/ghost/scan/directory.rs:99` `let group = meta_map.as_ref().and_then(|m| m.get("group").cloned());`
- `src-tauri/src/ghost/scan/directory.rs:113` `group,`
- `src-tauri/src/ghost/scan/directory.rs:145` `group: None,`
