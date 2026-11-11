# history.balloon.index(ID).汎用プロパティ名

- **規格**: [history.balloon.index-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/history.balloon.index-ID/) (ukadoc-spec/list/propertysystem/property-system/history.balloon.index-ID.md)
- **検索語**: history.balloon.index
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コードに「history.balloon.index」が見つからない。


## 実装箇所

- `src-tauri/src/shiori/property/tests.rs:96` `evaluate_property_query("history.balloon.index(0).name"),`
- `src-tauri/src/shiori/property/evaluator/dynamic_rules.rs:62` `if q.starts_with("history.balloon.index(")`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:19` `"history.balloon.index(0).name" | "history.balloon.index(0)" => "Default Balloon`
