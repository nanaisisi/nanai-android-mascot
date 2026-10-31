# group,グループ名

- **規格**: [group.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/group/) (ukadoc-spec/descript/shell-surfacetable/surfacetable-txt/group.md)
- **検索語**: group
- **対応状況**: ✅ 対応済 (surfacetable.rs)

## 突合結果

実装コードに「group」が見つからない。

## 実装箇所

- `src-tauri/src/commands/install/archive.rs:302` `let group = meta_map.as_ref().and_then(|m| m.get("group").cloned());`
- `src-tauri/src/commands/install/archive.rs:329` `group,`
- `src-tauri/src/common/models.rs:40` `pub group: Option<String>,`
- `src-tauri/src/ghost/scan/shell.rs:100` `// [sakura.bindgroup*.name,カテゴリ名,パーツ名,サムネイル名], [kero.bindgroup*.name,カテゴリ名,パーツ名,`
- `src-tauri/src/ghost/scan/shell.rs:101` `// [sakura.bindgroup*.addid,ID], [kero.bindgroup*.addid,ID], [char*.bindgroup*.a`
