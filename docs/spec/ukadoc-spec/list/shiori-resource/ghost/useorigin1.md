# useorigin1

- **規格**: [useorigin1.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/ghost/useorigin1/) (ukadoc-spec/list/shiori-resource/ghost/useorigin1.md)
- **検索語**: useorigin1
- **対応状況**: ⚠️ 一部対応

## 突合結果

useorigin1 SHIORIリソース・プロパティ評価処理を実装 (src-tauri/src/shiori/property.rs -> evaluate_property_query)。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/static_rules.rs:53` `"getaistate" | "getaistateex" | "legacyinterface" | "useorigin1" => "0",`
