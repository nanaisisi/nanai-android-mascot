# system.cpu.(キー)

- **規格**: [system.cpu.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/system.cpu/) (ukadoc-spec/list/propertysystem/property-system/system.cpu.md)
- **検索語**: system.cpu.
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「system.cpu.」が見つからない。


## 実装箇所

- `src-tauri/src/shiori/property.rs:91` `if q.starts_with("system.cpu.") {`
- `src-tauri/src/shiori/property.rs:153` `assert_eq!(evaluate_property_query("system.cpu.name"), "x86_64");`
- `ui/js/ghost/command-handler/env.js:137` `if (key.startsWith("system.cpu.")) return "x86_64";`
