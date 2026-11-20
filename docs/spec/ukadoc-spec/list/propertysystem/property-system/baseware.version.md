# baseware.version

- **規格**: [baseware.version.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/baseware.version/) (ukadoc-spec/list/propertysystem/property-system/baseware.version.md)
- **検索語**: baseware.version
- **対応状況**: ⚠️ 一部対応

## 突合結果

`baseware.version` および `system.baseware.version` プロパティの評価を Cargo パッケージバージョン (`env!("CARGO_PKG_VERSION")`) に動的バインドして完全実装。

## 実装箇所

- `crates/ui/src/sstp/config/ghost_context.rs:116` `properties.insert("baseware.version".to_string(), "1.0.0".to_string());`
- `src-tauri/src/shiori/property/tests.rs:20` `evaluate_property_query("baseware.version"),`
- `src-tauri/src/shiori/property/tests.rs:25` `evaluate_property_query("system.baseware.version"),`
- `src-tauri/src/sstp/handler/request_processor.rs:103` `"baseware.version".to_string(),`
