# char\*.recommendsites

- **規格**: [char-star-.recommendsites.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/ghost/char-star-.recommendsites/) (ukadoc-spec/list/shiori-resource/ghost/char-star-.recommendsites.md)
- **検索語**: char.recommendsites
- **対応状況**: ⚠️ 一部対応

## 突合結果

char.recommendsites SHIORIリソース・プロパティ評価処理を実装 (src-tauri/src/shiori/property.rs -> evaluate_property_query)。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/static_rules.rs:51` `"char.recommendbuttoncaption" | "char.recommendsites" => "",`
