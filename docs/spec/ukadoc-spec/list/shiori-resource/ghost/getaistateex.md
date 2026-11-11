# getaistateex

- **規格**: [getaistateex.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/ghost/getaistateex/) (ukadoc-spec/list/shiori-resource/ghost/getaistateex.md)
- **検索語**: getaistateex
- **対応状況**: ⚠️ 一部対応

## 突合結果

getaistateex SHIORIリソース・プロパティ評価処理を実装 (src-tauri/src/shiori/property.rs -> evaluate_property_query)。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/static_rules.rs:53` `"getaistate" | "getaistateex" | "legacyinterface" | "useorigin1" => "0",`
