# kero.recommendsites

- **規格**: [kero.recommendsites.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/ghost/kero.recommendsites/) (ukadoc-spec/list/shiori-resource/ghost/kero.recommendsites.md)
- **検索語**: kero.recommendsites
- **対応状況**: ✅ 実装済

## 突合結果

kero.recommendsites SHIORIリソース・プロパティ評価処理を実装 (src-tauri/src/shiori/property.rs -> evaluate_property_query)。

## 実装箇所

- `src-tauri/src/shiori/property.rs:43` `"kero.recommendbuttoncaption" | "kero.recommendsites" => "".to_string(),`
