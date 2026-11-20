# kero.defaulty,Y座標

- **規格**: [kero.defaulty.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/kero.defaulty/) (ukadoc-spec/descript/shell/descript-txt/kero.defaulty.md)
- **検索語**: kero.defaulty
- **対応状況**: ⚠️ 一部対応

## 突合結果

`crates/nanai-core/src/descript_parser/types.rs` の `kero_default_pos()` および SHIORI プロパティ評価系において `kero.defaulty` のパースおよび初期画面座標参照が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/descript_parser/types.rs:112` `/// Kero側のデフォルト座標 (`kero.defaultx`, `kero.defaulty`)`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:48` `"kero.defaultleft" | "kero.defaulttop" | "kero.defaultx" | "kero.defaulty" => "0`
- `crates/nanai-core/src/descript_parser/types.rs:118` `.get("kero.defaulty")`
