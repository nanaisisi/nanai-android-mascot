# kero.defaultx,X座標

- **規格**: [kero.defaultx.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/kero.defaultx.md)
- **検索語**: kero.defaultx
- **対応状況**: ✅ 実装済

## 突合結果

`crates/nanai-core/src/descript_parser/types.rs` の `kero_default_pos()` および SHIORI セーフティプロパティ評価系において `kero.defaultx` のパース・参照が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs` (`kero_default_pos`)
- `src-tauri/src/shiori/property/evaluator/static_rules.rs` (`kero.defaultx`)
