# update_time

- **規格**: [update_time.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/update_time/)
- **検索語**: update_time
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「update_time」が見つからない。


## 実装箇所

- `src-tauri/src/shiori/property.rs:84` `"update_time" => "0".to_string(),`
- `src-tauri/src/shiori/property.rs:165` `assert_eq!(evaluate_property_query("update_time"), "0");`
- `ui/js/ghost/command-handler/env.js:130` `case "update_time":`
