# \![set,property,プロパティ名,値]

- **規格**: [bang-set-property.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/property-system-operation/bang-set-property/) (ukadoc-spec/list/sakura-script/property-system-operation/bang-set-property.md)
- **検索語**: evaluate_property_query
- **対応状況**: ✅ 実装済

## 突合結果

`\![set,property,...]` (プロパティ値設定) コマンドおよびプロパティシステム評価処理を実装 (`src-tauri/src/shiori/property.rs` -> `evaluate_property_query`, `crates/ui/src/script/parser/brackets/handlers/raiselike.rs`)。

## 実装箇所

- `src-tauri/src/shiori/property.rs:12` `pub fn evaluate_property_query(query: &str) -> String {`
- `src-tauri/src/shiori/property.rs:52` `Ok(evaluate_property_query(&query))`
- `src-tauri/src/shiori/property.rs:61` `assert_eq!(evaluate_property_query("ghostlist.count"), "1");`
- `src-tauri/src/shiori/property.rs:63` `evaluate_property_query("baseware.name"),`
- `src-tauri/src/shiori/property.rs:66` `assert_eq!(evaluate_property_query("currentghost.name"), "Mock Ghost");`
