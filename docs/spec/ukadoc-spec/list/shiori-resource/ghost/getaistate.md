# getaistate

- **規格**: [getaistate.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/ghost/getaistate/) (ukadoc-spec/list/shiori-resource/ghost/getaistate.md)
- **検索語**: getaistate
- **対応状況**: ⚠️ 一部対応

## 突合結果

getaistate SHIORIリソース・プロパティ評価処理を実装 (src-tauri/src/shiori/property.rs -> evaluate_property_query)。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/static_rules.rs:53` `"getaistate" | "getaistateex" | "legacyinterface" | "useorigin1" => "0",`
