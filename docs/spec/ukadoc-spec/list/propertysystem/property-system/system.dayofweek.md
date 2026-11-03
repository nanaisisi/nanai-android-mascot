# system.dayofweek

- **規格**: [system.dayofweek.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/system.dayofweek/) (ukadoc-spec/list/propertysystem/property-system/system.dayofweek.md)
- **検索語**: system.dayofweek
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「system.dayofweek」が見つからない。


## 実装箇所

- `src-tauri/src/shiori/property.rs:77` `"system.dayofweek" => "2".to_string(),`
- `src-tauri/src/shiori/property.rs:145` `assert_eq!(evaluate_property_query("system.dayofweek"), "2");`
- `ui/js/ghost/command-handler/env.js:118` `case "system.dayofweek":`
