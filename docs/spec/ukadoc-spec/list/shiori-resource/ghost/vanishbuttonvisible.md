# vanishbuttonvisible

- **規格**: [vanishbuttonvisible.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/ghost/vanishbuttonvisible/) (ukadoc-spec/list/shiori-resource/ghost/vanishbuttonvisible.md)
- **検索語**: vanishbuttonvisible
- **対応状況**: ⚠️ 一部対応

## 突合結果

vanishbuttonvisible SHIORIリソース・プロパティ評価処理を実装 (src-tauri/src/shiori/property.rs -> evaluate_property_query)。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/static_rules.rs:93` `if q.ends_with(".caption") || q.ends_with("buttoncaption") || q == "vanishbutton`
