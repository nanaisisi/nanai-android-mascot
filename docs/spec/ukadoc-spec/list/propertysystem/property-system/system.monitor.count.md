# system.monitor.count

- **規格**: [system.monitor.count.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/system.monitor.count/) (ukadoc-spec/list/propertysystem/property-system/system.monitor.count.md)
- **検索語**: system.monitor.count
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「system.monitor.count」が見つからない。


## 実装箇所

- `src-tauri/src/shiori/property.rs:82` `"system.monitor.count" => "1".to_string(),`
- `src-tauri/src/shiori/property.rs:150` `assert_eq!(evaluate_property_query("system.monitor.count"), "1");`
- `ui/js/ghost/command-handler/env.js:127` `case "system.monitor.count":`
