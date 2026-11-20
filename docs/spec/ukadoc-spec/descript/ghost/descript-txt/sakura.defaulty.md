# sakura.defaulty,Y座標

- **規格**: [sakura.defaulty.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sakura.defaulty.md)
- **検索語**: sakura.defaulty
- **対応状況**: ⚠️ 一部対応

## 突合結果

`crates/nanai-core/src/descript_parser/types.rs` の `sakura_default_pos()` および SHIORI セーフティプロパティ評価系において `sakura.defaulty` のパース・参照が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:98` `/// Sakura側のデフォルト座標 (`sakura.defaultx`, `sakura.defaulty`)`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:40` `"sakura.defaultleft" | "sakura.defaulttop" | "sakura.defaultx" | "sakura.default`
- `crates/nanai-core/src/descript_parser/types.rs:104` `.get("sakura.defaulty")`
