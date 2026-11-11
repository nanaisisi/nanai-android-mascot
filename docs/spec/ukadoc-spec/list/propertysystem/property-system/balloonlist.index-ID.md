# balloonlist.index(ID).汎用プロパティ名

- **規格**: [balloonlist.index-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/balloonlist.index-ID/) (ukadoc-spec/list/propertysystem/property-system/balloonlist.index-ID.md)
- **検索語**: balloonlist.index
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コード内に「balloonlist.index」を確認。

## 実装箇所

- `src-tauri/src/shiori/property/tests.rs:62` `evaluate_property_query("balloonlist.index(0).name"),`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:9` `"balloonlist.index(0).name" | "balloonlist.index(0)" => "Default Balloon",`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:10` `"balloonlist.index(0).path" => "default_balloon",`
