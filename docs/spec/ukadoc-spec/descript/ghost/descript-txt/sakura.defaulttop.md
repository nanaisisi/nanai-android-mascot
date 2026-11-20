# sakura.defaulttop,Y座標

- **規格**: [sakura.defaulttop.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sakura.defaulttop.md)
- **検索語**: sakura.defaulttop
- **対応状況**: ⚠️ 一部対応

## 突合結果

`crates/nanai-core/src/descript_parser/types.rs` の `sakura_default_pos()` および SHIORI セーフティプロパティ評価系において `sakura.defaulttop` のパース・参照が完全実装済み。

## 実装箇所

- `crates/ui/src/descript/tests.rs:102` `sakura.defaulttop,20\n";`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:40` `"sakura.defaultleft" | "sakura.defaulttop" | "sakura.defaultx" | "sakura.default`
