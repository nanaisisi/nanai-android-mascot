# legacyinterface

- **規格**: [legacyinterface.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/ghost/legacyinterface/) (ukadoc-spec/list/shiori-resource/ghost/legacyinterface.md)
- **検索語**: legacyinterface
- **対応状況**: ✅ 実装済

## 突合結果

legacyinterface SHIORIリソース・プロパティ評価処理を実装 (src-tauri/src/shiori/property.rs -> evaluate_property_query)。

## 実装箇所

- `src-tauri/src/shiori/property.rs:48` `"getaistate" | "getaistateex" | "legacyinterface" | "useorigin1" => "0".to_strin`
