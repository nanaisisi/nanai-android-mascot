# currentghost.shelllist(シェル名/パス).汎用プロパティ名

- **規格**: [currentghost.shelllist.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/currentghost.shelllist/) (ukadoc-spec/list/propertysystem/property-system/currentghost.shelllist.md)
- **検索語**: currentghost.shelllist
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コードに「currentghost.shelllist」が見つからない。


## 実装箇所

- `src-tauri/src/shiori/property/evaluator/mod.rs:80` `"currentghost.shelllist.count" => {`
- `src-tauri/src/shiori/property/evaluator/mod.rs:83` `"currentghost.shelllist.current.name" | "currentghost.shelllist.current" => {`
- `src-tauri/src/shiori/property/evaluator/mod.rs:120` `// Evaluate currentghost.shelllist(KEY).property_name`
- `src-tauri/src/shiori/property/evaluator/mod.rs:121` `if let Some(shell_prop) = q.strip_prefix("currentghost.shelllist(")`
