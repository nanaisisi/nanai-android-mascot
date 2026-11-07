# history.balloon(バルーン名/パス).汎用プロパティ名

- **規格**: [history.balloon.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/history.balloon/) (ukadoc-spec/list/propertysystem/property-system/history.balloon.md)
- **検索語**: history.balloon
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「history.balloon」が見つからない。


## 実装箇所

- `src-tauri/src/shiori/property.rs:30` `"history.balloon.count" => "1".to_string(),`
- `src-tauri/src/shiori/property.rs:31` `"history.balloon.index(0).name" | "history.balloon.index(0)" => "Default Balloon`
- `src-tauri/src/shiori/property.rs:162` `if q.starts_with("history.balloon.index(") || q.starts_with("history.balloon(") `
- `src-tauri/src/shiori/property.rs:266` `assert_eq!(evaluate_property_query("history.balloon.count"), "1");`
- `src-tauri/src/shiori/property.rs:268` `evaluate_property_query("history.balloon.index(0).name"),`
