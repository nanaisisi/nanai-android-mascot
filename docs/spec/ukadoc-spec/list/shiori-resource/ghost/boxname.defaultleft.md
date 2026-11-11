# (入力ボックス種類).defaultleft　(入力ボックス種類).defaulttop

- **規格**: [boxname.defaultleft.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/ghost/boxname.defaultleft/) (ukadoc-spec/list/shiori-resource/ghost/boxname.defaultleft.md)
- **検索語**: boxname.defaultleft
- **対応状況**: ⚠️ 一部対応

## 突合結果

boxname.defaultleft SHIORIリソース・プロパティ評価処理を実装 (src-tauri/src/shiori/property.rs -> evaluate_property_query)。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/static_rules.rs:52` `"boxname.defaultleft" | "inputbox.defaultleft" => "0",`
