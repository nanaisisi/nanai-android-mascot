# kero.defaulty

- **規格**: [kero.defaulty.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/ghost/kero.defaulty/) (ukadoc-spec/list/shiori-resource/ghost/kero.defaulty.md)
- **検索語**: kero.defaulty
- **対応状況**: ⚠️ 一部対応

## 突合結果

kero.defaulty SHIORIリソース・プロパティ評価処理を実装 (src-tauri/src/shiori/property.rs -> evaluate_property_query)。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/static_rules.rs:46` `"kero.defaultleft" | "kero.defaulttop" | "kero.defaultx" | "kero.defaulty" => "0`
