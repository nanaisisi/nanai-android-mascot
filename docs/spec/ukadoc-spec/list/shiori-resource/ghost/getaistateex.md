# getaistateex

- **規格**: [getaistateex.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/ghost/getaistateex/) (ukadoc-spec/list/shiori-resource/ghost/getaistateex.md)
- **検索語**: getaistateex
- **対応状況**: ✅ 実装済

## 突合結果

getaistateex SHIORIリソース・プロパティ評価処理を実装 (src-tauri/src/shiori/property.rs -> evaluate_property_query)。

## 実装箇所

- `src-tauri/src/shiori/property.rs:48` `"getaistate" | "getaistateex" | "legacyinterface" | "useorigin1" => "0".to_strin`
