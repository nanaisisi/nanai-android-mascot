# kero.defaulttop

- **規格**: [kero.defaulttop.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/ghost/kero.defaulttop/) (ukadoc-spec/list/shiori-resource/ghost/kero.defaulttop.md)
- **検索語**: kero.defaulttop
- **対応状況**: ⚠️ 一部対応

## 突合結果

kero.defaulttop SHIORIリソース・プロパティ評価処理を実装 (src-tauri/src/shiori/property.rs -> evaluate_property_query)。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/static_rules.rs:46` `"kero.defaultleft" | "kero.defaulttop" | "kero.defaultx" | "kero.defaulty" => "0`
