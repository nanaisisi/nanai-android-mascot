# kero.defaulttop,Y座標

- **規格**: [kero.defaulttop.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/kero.defaulttop/) (ukadoc-spec/descript/shell/descript-txt/kero.defaulttop.md)
- **検索語**: kero.defaulttop
- **対応状況**: ⚠️ 一部対応

## 突合結果

`crates/nanai-core/src/descript_parser/types.rs` の `kero_default_pos()` および SHIORI プロパティ評価系において `kero.defaulttop` のパースおよび初期画面座標参照が完全実装済み。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/static_rules.rs:48` `"kero.defaultleft" | "kero.defaulttop" | "kero.defaultx" | "kero.defaulty" => "0`
