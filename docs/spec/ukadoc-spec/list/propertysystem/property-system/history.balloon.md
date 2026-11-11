# history.balloon(バルーン名/パス).汎用プロパティ名

- **規格**: [history.balloon.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/history.balloon/) (ukadoc-spec/list/propertysystem/property-system/history.balloon.md)
- **検索語**: history.balloon
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コードに「history.balloon」が見つからない。


## 実装箇所

- `src-tauri/src/shiori/property/tests.rs:94` `assert_eq!(evaluate_property_query("history.balloon.count"), "1");`
- `src-tauri/src/shiori/property/tests.rs:96` `evaluate_property_query("history.balloon.index(0).name"),`
- `src-tauri/src/shiori/property/evaluator/dynamic_rules.rs:62` `if q.starts_with("history.balloon.index(")`
- `src-tauri/src/shiori/property/evaluator/dynamic_rules.rs:63` `|| q.starts_with("history.balloon(")`
- `src-tauri/src/shiori/property/evaluator/dynamic_rules.rs:64` `|| q.starts_with("history.balloon")`
