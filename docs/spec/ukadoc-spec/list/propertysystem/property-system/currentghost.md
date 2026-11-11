# currentghost.汎用プロパティ名

- **規格**: [currentghost.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/currentghost/) (ukadoc-spec/list/propertysystem/property-system/currentghost.md)
- **検索語**: currentghost.
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コード内に「currentghost.」を確認。

## 実装箇所

- `src-tauri/src/shiori/property/tests.rs:14` `assert_eq!(evaluate_property_query("currentghost.name"), "Mock Ghost");`
- `src-tauri/src/shiori/property/tests.rs:65` `assert_eq!(evaluate_property_query("currentghost.balloon.count"), "1");`
- `src-tauri/src/shiori/property/tests.rs:67` `evaluate_property_query("currentghost.balloon.name"),`
- `src-tauri/src/shiori/property/tests.rs:71` `evaluate_property_query("currentghost.balloon.mousecursor.arrow"),`
- `src-tauri/src/shiori/property/tests.rs:75` `evaluate_property_query("currentghost.balloon.scope(0).rect"),`
