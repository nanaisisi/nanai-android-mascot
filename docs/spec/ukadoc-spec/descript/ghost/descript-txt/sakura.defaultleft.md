# sakura.defaultleft,X座標

- **規格**: [sakura.defaultleft.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sakura.defaultleft.md)
- **検索語**: sakura.defaultleft
- **対応状況**: ✅ 実装済

## 突合結果

`crates/nanai-core/src/descript_parser/types.rs` の `sakura_default_pos()` および SHIORI セーフティプロパティ評価系において `sakura.defaultleft` のパース・参照が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs` (`sakura_default_pos`)
- `src-tauri/src/shiori/property/evaluator/static_rules.rs` (`sakura.defaultleft`)
