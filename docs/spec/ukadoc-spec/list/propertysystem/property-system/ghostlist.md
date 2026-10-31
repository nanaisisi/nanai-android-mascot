# ghostlist(ゴースト名/本体側名/パス).汎用プロパティ名

- **規格**: [ghostlist.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/ghostlist/) (ukadoc-spec/list/propertysystem/property-system/ghostlist.md)
- **検索語**: ghostlist
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「ghostlist」を確認。

## 実装箇所

- `src-tauri/src/shiori/property.rs:15` `"ghostlist.count" => "1".to_string(),`
- `src-tauri/src/shiori/property.rs:16` `"ghostlist.index(0).name" | "ghostlist.index(0)" => "Mock Ghost".to_string(),`
- `src-tauri/src/shiori/property.rs:17` `"ghostlist.index(0).path" => "mock_ghost".to_string(),`
- `src-tauri/src/shiori/property.rs:61` `assert_eq!(evaluate_property_query("ghostlist.count"), "1");`
