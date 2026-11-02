# system.hour

- **規格**: [system.hour.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/system.hour/) (ukadoc-spec/list/propertysystem/property-system/system.hour.md)
- **検索語**: system.hour
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「system.hour」が見つからない。


## 実装箇所

- `src-tauri/src/shiori/property.rs:73` `"system.hour" => "12".to_string(),`
- `src-tauri/src/shiori/property.rs:141` `assert_eq!(evaluate_property_query("system.hour"), "12");`
- `ui/js/ghost/command-handler/env.js:110` `case "system.hour":`
