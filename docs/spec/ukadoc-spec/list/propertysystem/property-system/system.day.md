# system.day

- **規格**: [system.day.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/system.day/) (ukadoc-spec/list/propertysystem/property-system/system.day.md)
- **検索語**: system.day
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「system.day」が見つからない。


## 実装箇所

- `src-tauri/src/shiori/property.rs:72` `"system.day" => "3".to_string(),`
- `src-tauri/src/shiori/property.rs:77` `"system.dayofweek" => "2".to_string(),`
- `src-tauri/src/shiori/property.rs:140` `assert_eq!(evaluate_property_query("system.day"), "3");`
- `src-tauri/src/shiori/property.rs:145` `assert_eq!(evaluate_property_query("system.dayofweek"), "2");`
- `ui/js/ghost/command-handler/env.js:108` `case "system.day":`
