# baseware.version

- **規格**: [baseware.version.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/baseware.version/) (ukadoc-spec/list/propertysystem/property-system/baseware.version.md)
- **検索語**: baseware.version
- **対応状況**: ✅ 実装済

## 突合結果

`baseware.version` および `system.baseware.version` プロパティの評価を Cargo パッケージバージョン (`env!("CARGO_PKG_VERSION")`) に動的バインドして完全実装。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/static_rules.rs` `"baseware.version" | "system.baseware.version" => env!("CARGO_PKG_VERSION")`
- `src-tauri/src/sstp/handler/request_processor.rs` `properties.insert("baseware.version", env!("CARGO_PKG_VERSION"))`
