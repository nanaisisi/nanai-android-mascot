# system.disk.count

- **規格**: [system.disk.count.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/system.disk.count/) (ukadoc-spec/list/propertysystem/property-system/system.disk.count.md)
- **検索語**: system.disk.count
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「system.disk.count」が見つからない。


## 実装箇所

- `src-tauri/src/shiori/property.rs:83` `"system.disk.count" => "1".to_string(),`
- `src-tauri/src/shiori/property.rs:151` `assert_eq!(evaluate_property_query("system.disk.count"), "1");`
- `ui/js/ghost/command-handler/env.js:128` `case "system.disk.count":`
