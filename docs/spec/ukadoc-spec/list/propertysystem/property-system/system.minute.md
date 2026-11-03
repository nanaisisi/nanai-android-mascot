# system.minute

- **規格**: [system.minute.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/system.minute/) (ukadoc-spec/list/propertysystem/property-system/system.minute.md)
- **検索語**: system.minute
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「system.minute」が見つからない。


## 実装箇所

- `src-tauri/src/shiori/property.rs:74` `"system.minute" => "0".to_string(),`
- `src-tauri/src/shiori/property.rs:142` `assert_eq!(evaluate_property_query("system.minute"), "0");`
- `ui/js/ghost/command-handler/env.js:112` `case "system.minute":`
