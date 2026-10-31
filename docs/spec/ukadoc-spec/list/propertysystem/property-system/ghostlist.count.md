# ghostlist.count

- **規格**: [ghostlist.count.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/ghostlist.count/) (ukadoc-spec/list/propertysystem/property-system/ghostlist.count.md)
- **検索語**: ghostlist.count
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「ghostlist.count」を確認。

## 実装箇所

- `src-tauri/src/shiori/property.rs:15` `"ghostlist.count" => "1".to_string(),`
- `src-tauri/src/shiori/property.rs:55` `assert_eq!(evaluate_property_query("ghostlist.count"), "1");`
