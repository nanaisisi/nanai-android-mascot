# sakura.defaultx,X座標

- **規格**: [sakura.defaultx.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/sakura.defaultx.md)
- **検索語**: sakura.defaultx
- **対応状況**: ⚠️ 一部対応

## 突合結果

`crates/nanai-core/src/descript_parser/types.rs` の `sakura_default_pos()` および SHIORI セーフティプロパティ評価系において `sakura.defaultx` のパース・参照が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/tests.rs:61` `let content = "sakura.defaultx,100\nsakura.defaulty,200\nkero.defaultx,300\nkero`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:40` `"sakura.defaultleft" | "sakura.defaulttop" | "sakura.defaultx" | "sakura.default`
- `crates/nanai-core/src/descript_parser/types.rs:98` `/// Sakura側のデフォルト座標 (`sakura.defaultx`, `sakura.defaulty`)`
- `crates/nanai-core/src/descript_parser/types.rs:101` `.get("sakura.defaultx")`
- `crates/ui/src/descript/tests.rs:6` `sakura.defaultx,120\r\nsakura.defaulty,240\r\n\`
