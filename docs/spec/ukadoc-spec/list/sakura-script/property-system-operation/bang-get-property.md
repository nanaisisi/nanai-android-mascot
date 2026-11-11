# \![get,property,イベント名,プロパティ名,プロパティ名,...]

- **規格**: [bang-get-property.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/property-system-operation/bang-get-property/) (ukadoc-spec/list/sakura-script/property-system-operation/bang-get-property.md)
- **検索語**: evaluate_property_query
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\![get,property,...]` (プロパティ値取得) コマンドおよびプロパティシステム評価処理を実装 (`src-tauri/src/shiori/property.rs` -> `evaluate_property_query`, `crates/ui/src/script/parser/brackets/handlers/raiselike.rs`)。

## 実装箇所

- `src-tauri/src/shiori/property/mod.rs:10` `pub use evaluator::evaluate_property_query;`
- `src-tauri/src/shiori/property/mod.rs:20` `Ok(evaluate_property_query(&query))`
- `src-tauri/src/shiori/property/tests.rs:5` `use super::evaluator::evaluate_property_query;`
- `src-tauri/src/shiori/property/tests.rs:9` `assert_eq!(evaluate_property_query("ghostlist.count"), "1");`
- `src-tauri/src/shiori/property/tests.rs:11` `evaluate_property_query("baseware.name"),`
