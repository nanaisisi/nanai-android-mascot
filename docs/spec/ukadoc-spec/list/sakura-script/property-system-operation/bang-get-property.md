# \![get,property,イベント名,プロパティ名,プロパティ名,...]

- **規格**: [bang-get-property.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/property-system-operation/bang-get-property/) (ukadoc-spec/list/sakura-script/property-system-operation/bang-get-property.md)
- **検索語**: evaluate_property_query
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\![get,property,...]` (プロパティ値取得) コマンドおよびプロパティシステム評価処理を実装 (`src-tauri/src/shiori/property.rs` -> `evaluate_property_query`, `crates/ui/src/script/parser/brackets/handlers/raiselike.rs`)。

## 実装箇所

- `src-tauri/src/shiori/property/mod.rs:13` `SystemMonitorInfo, evaluate_property_query, evaluate_property_query_full,`
- `src-tauri/src/shiori/property/tests.rs:1` `use super::evaluator::{evaluate_property_query, evaluate_property_query_with_con`
- `src-tauri/src/shiori/property/tests.rs:13` `assert_eq!(evaluate_property_query("currentghost.name"), "");`
- `src-tauri/src/shiori/property/tests.rs:14` `assert_eq!(evaluate_property_query("ghostlist.count"), "0");`
- `src-tauri/src/shiori/property/tests.rs:16` `evaluate_property_query("baseware.name"),`
