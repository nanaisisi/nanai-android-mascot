# currentghost.汎用プロパティ名

- **規格**: [currentghost.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/currentghost/) (ukadoc-spec/list/propertysystem/property-system/currentghost.md)
- **検索語**: currentghost.
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「currentghost.」を確認。


## 実装箇所

- `src-tauri/src/shiori/property.rs:25` `"currentghost.name" => "Mock Ghost".to_string(),`
- `src-tauri/src/shiori/property.rs:26` `"currentghost.path" => "mock_ghost".to_string(),`
- `src-tauri/src/shiori/property.rs:27` `"currentghost.craftman" => "Ukagaka Creator".to_string(),`
- `src-tauri/src/shiori/property.rs:28` `"currentghost.craftmanurl" => "https://example.com".to_string(),`
- `src-tauri/src/shiori/property.rs:32` `if q.starts_with("currentghost.scope(") {`
