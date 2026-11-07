# currentghost.balloon.scope(ID).rect

- **規格**: [currentghost.balloon.scope-ID-.rect.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/currentghost.balloon.scope-ID-.rect/) (ukadoc-spec/list/propertysystem/property-system/currentghost.balloon.scope-ID-.rect.md)
- **検索語**: currentghost.balloon.scope
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「currentghost.balloon.scope」が見つからない。


## 実装箇所

- `src-tauri/src/shiori/property.rs:140` `if let Some(scope_prop) = q.strip_prefix("currentghost.balloon.scope(") {`
- `src-tauri/src/shiori/property.rs:141` `// currentghost.balloon.scope(ID).* evaluation`
- `src-tauri/src/shiori/property.rs:247` `evaluate_property_query("currentghost.balloon.scope(0).rect"),`
- `src-tauri/src/shiori/property.rs:251` `evaluate_property_query("currentghost.balloon.scope(0).validwidth"),`
- `src-tauri/src/shiori/property.rs:255` `evaluate_property_query("currentghost.balloon.scope(0).validheight"),`
