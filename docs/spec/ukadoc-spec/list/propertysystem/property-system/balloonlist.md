# balloonlist(バルーン名/パス).汎用プロパティ名

- **規格**: [balloonlist.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/balloonlist/) (ukadoc-spec/list/propertysystem/property-system/balloonlist.md)
- **検索語**: balloonlist
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コード内に「balloonlist」を確認。

## 実装箇所

- `src-tauri/src/shiori/property/tests.rs:60` `assert_eq!(evaluate_property_query("balloonlist.count"), "1");`
- `src-tauri/src/shiori/property/tests.rs:62` `evaluate_property_query("balloonlist.index(0).name"),`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:8` `"balloonlist.count" => "1",`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:9` `"balloonlist.index(0).name" | "balloonlist.index(0)" => "Default Balloon",`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:10` `"balloonlist.index(0).path" => "default_balloon",`
