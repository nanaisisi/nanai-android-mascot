# system.network.(キー)

- **規格**: [system.network.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/system.network/) (ukadoc-spec/list/propertysystem/property-system/system.network.md)
- **検索語**: system.network.
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「system.network.」が見つからない。


## 実装箇所

- `src-tauri/src/shiori/property.rs:100` `if q.starts_with("system.network.") {`
- `src-tauri/src/shiori/property.rs:156` `assert_eq!(evaluate_property_query("system.network.state"), "online");`
- `ui/js/ghost/command-handler/env.js:140` `if (key.startsWith("system.network.")) return "online";`
