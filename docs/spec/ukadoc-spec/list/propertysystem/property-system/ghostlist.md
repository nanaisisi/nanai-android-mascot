# ghostlist(ゴースト名/本体側名/パス).汎用プロパティ名

- **規格**: [ghostlist.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/ghostlist/) (ukadoc-spec/list/propertysystem/property-system/ghostlist.md)
- **検索語**: ghostlist
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コード内に「ghostlist」を確認。

## 実装箇所

- `src-tauri/src/shiori/property/tests.rs:9` `assert_eq!(evaluate_property_query("ghostlist.count"), "1");`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:5` `"ghostlist.count" => "1",`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:6` `"ghostlist.index(0).name" | "ghostlist.index(0)" => "Mock Ghost",`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:7` `"ghostlist.index(0).path" => "mock_ghost",`
- `src-tauri/src/sstp/handler/request_processor.rs:96` `properties.insert("ghostlist.count".to_string(), "1".to_string());`
