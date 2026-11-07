# history.balloon.index(ID).汎用プロパティ名

- **規格**: [history.balloon.index-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/history.balloon.index-ID/) (ukadoc-spec/list/propertysystem/property-system/history.balloon.index-ID.md)
- **検索語**: history.balloon.index
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「history.balloon.index」が見つからない。


## 実装箇所

- `src-tauri/src/shiori/property.rs:31` `"history.balloon.index(0).name" | "history.balloon.index(0)" => "Default Balloon`
- `src-tauri/src/shiori/property.rs:162` `if q.starts_with("history.balloon.index(") || q.starts_with("history.balloon(") `
- `src-tauri/src/shiori/property.rs:268` `evaluate_property_query("history.balloon.index(0).name"),`
