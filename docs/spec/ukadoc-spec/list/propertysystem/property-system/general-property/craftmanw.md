# craftmanw

- **規格**: [craftmanw.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/craftmanw/)
- **検索語**: craftmanw
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コード内に「craftmanw」を確認。

## 実装箇所

- `src-tauri/src/commands/ext.rs:40` `.or_else(|| map.get("craftmanw").cloned());`
- `src-tauri/src/commands/ext.rs:105` `.or_else(|| map.get("craftmanw").cloned());`
- `src-tauri/src/ghost/scan/directory/manifest.rs:87` `.or_else(|| m.get("craftmanw").cloned())`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:36` `"craftmanw" => "Ukagaka Creator",`
- `crates/ui/src/descript/tests.rs:84` `assert_eq!(desc.craftmanw().unwrap(), "Author");`
