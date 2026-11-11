# ghostlist.index(ID).汎用プロパティ名

- **規格**: [ghostlist.index-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/ghostlist.index-ID/) (ukadoc-spec/list/propertysystem/property-system/ghostlist.index-ID.md)
- **検索語**: ghostlist.index
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コード内に「ghostlist.index」を確認。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/static_rules.rs:6` `"ghostlist.index(0).name" | "ghostlist.index(0)" => "Mock Ghost",`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:7` `"ghostlist.index(0).path" => "mock_ghost",`
