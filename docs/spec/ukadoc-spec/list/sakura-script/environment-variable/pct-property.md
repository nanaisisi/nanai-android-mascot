# %property\[プロパティ名\]

- **規格**: [pct-property.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-property/) (ukadoc-spec/list/sakura-script/environment-variable/pct-property.md)
- **検索語**: property
- **対応状況**: 📝 コメントのみ(未実装の可能性大)

## 突合結果

実装コードに「property」が出現。実際の処理内容は未精査。

## 実装箇所

- `src-tauri/src/lib.rs:157` `shiori::property::get_system_property,`
- `src-tauri/src/shiori/mod.rs:6` `pub mod property;`
- `src-tauri/src/shiori/property.rs:1` `//! Property System evaluation engine specification implementation (UKADOC prope`
- `src-tauri/src/shiori/property.rs:11` `/// Evaluate property system queries conforming to UKADOC propertysystem spec`
- `src-tauri/src/shiori/property.rs:12` `pub fn evaluate_property_query(query: &str) -> String {`
