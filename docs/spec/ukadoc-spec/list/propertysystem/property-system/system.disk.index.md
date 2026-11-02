# system.disk.index(ID).(キー)

- **規格**: [system.disk.index.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/system.disk.index/) (ukadoc-spec/list/propertysystem/property-system/system.disk.index.md)
- **検索語**: system.disk.index
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「system.disk.index」が見つからない。


## 実装箇所

- `src-tauri/src/shiori/property.rs:106` `if q.starts_with("system.disk.index") {`
- `src-tauri/src/shiori/property.rs:162` `evaluate_property_query("system.disk.index(0).free"),`
- `ui/js/ghost/command-handler/env.js:142` `if (key.startsWith("system.disk.index")) return "100000";`
