# char\*.defaultx

- **規格**: [char-star-.defaultx.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/ghost/char-star-.defaultx/) (ukadoc-spec/list/shiori-resource/ghost/char-star-.defaultx.md)
- **検索語**: char.defaultx
- **対応状況**: ✅ 実装済

## 突合結果

char.defaultx SHIORIリソース・プロパティ評価処理を実装 (src-tauri/src/shiori/property.rs -> evaluate_property_query)。

## 実装箇所

- `src-tauri/src/shiori/property.rs:44` `"char.defaultleft" | "char.defaulttop" | "char.defaultx" | "char.defaulty" => "0`
