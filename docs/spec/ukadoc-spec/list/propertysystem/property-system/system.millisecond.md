# system.millisecond

- **規格**: [system.millisecond.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/system.millisecond/) (ukadoc-spec/list/propertysystem/property-system/system.millisecond.md)
- **検索語**: system.millisecond
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「system.millisecond」が見つからない。


## 実装箇所

- `src-tauri/src/shiori/property.rs:76` `"system.millisecond" => "0".to_string(),`
- `src-tauri/src/shiori/property.rs:144` `assert_eq!(evaluate_property_query("system.millisecond"), "0");`
- `ui/js/ghost/command-handler/env.js:116` `case "system.millisecond":`
