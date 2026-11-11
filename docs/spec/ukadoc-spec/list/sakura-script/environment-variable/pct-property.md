# %property\[プロパティ名\]

- **規格**: [pct-property.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-property/) (ukadoc-spec/list/sakura-script/environment-variable/pct-property.md)
- **検索語**: property
- **対応状況**: ⚠️ 一部対応

## 突合結果

プロパティシステム評価エンジン (`src-tauri/src/shiori/property.rs` -> `evaluate_property_query`) にてプロパティ照会・取得処理を実装済。

## 実装箇所

- `src-tauri/src/lib.rs:186` `shiori::property::get_system_property,`
- `src-tauri/src/shiori/mod.rs:6` `pub mod property;`
- `src-tauri/src/shiori/property/tests.rs:141` `"(unknown property: unknown.prop)"`
- `src-tauri/src/shiori/property/evaluator/dynamic_rules.rs:11` `_ => format!("(unknown shiori property: {})", shiori_var),`
- `src-tauri/src/shiori/property/evaluator/dynamic_rules.rs:68` `format!("(unknown property: {})", raw_query)`
