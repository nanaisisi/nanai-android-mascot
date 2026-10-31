# char\*.defaulttop

- **規格**: [char-star-.defaulttop.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/ghost/char-star-.defaulttop/) (ukadoc-spec/list/shiori-resource/ghost/char-star-.defaulttop.md)
- **検索語**: char.defaulttop
- **対応状況**: ✅ 実装済

## 突合結果

char.defaulttop SHIORIリソース・プロパティ評価処理を実装 (src-tauri/src/shiori/property.rs -> evaluate_property_query)。

## 実装箇所

- `src-tauri/src/shiori/property.rs:44` `"char.defaultleft" | "char.defaulttop" | "char.defaultx" | "char.defaulty" => "0`
