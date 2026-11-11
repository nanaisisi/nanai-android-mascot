# char\*.defaultleft

- **規格**: [char-star-.defaultleft.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/ghost/char-star-.defaultleft/) (ukadoc-spec/list/shiori-resource/ghost/char-star-.defaultleft.md)
- **検索語**: char.defaultleft
- **対応状況**: ⚠️ 一部対応

## 突合結果

char.defaultleft SHIORIリソース・プロパティ評価処理を実装 (src-tauri/src/shiori/property.rs -> evaluate_property_query)。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/static_rules.rs:49` `"char.defaultleft" | "char.defaulttop" | "char.defaultx" | "char.defaulty" => "0`
