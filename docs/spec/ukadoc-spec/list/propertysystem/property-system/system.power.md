# system.power.(キー)

- **規格**: [system.power.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/system.power/) (ukadoc-spec/list/propertysystem/property-system/system.power.md)
- **検索語**: system.power.
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「system.power.」が見つからない。


## 実装箇所

- `src-tauri/src/shiori/property.rs:97` `if q.starts_with("system.power.") {`
- `src-tauri/src/shiori/property.rs:155` `assert_eq!(evaluate_property_query("system.power.state"), "ac");`
- `ui/js/ghost/command-handler/env.js:139` `if (key.startsWith("system.power.")) return "ac";`
