# system.memory.(キー)

- **規格**: [system.memory.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/system.memory/) (ukadoc-spec/list/propertysystem/property-system/system.memory.md)
- **検索語**: system.memory.
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「system.memory.」が見つからない。


## 実装箇所

- `src-tauri/src/shiori/property.rs:94` `if q.starts_with("system.memory.") {`
- `src-tauri/src/shiori/property.rs:154` `assert_eq!(evaluate_property_query("system.memory.total"), "1024");`
- `ui/js/ghost/command-handler/env.js:138` `if (key.startsWith("system.memory.")) return "1024";`
