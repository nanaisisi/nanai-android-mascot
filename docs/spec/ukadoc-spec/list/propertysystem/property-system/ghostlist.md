# ghostlist(ゴースト名/本体側名/パス).汎用プロパティ名

- **規格**: [ghostlist.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/ghostlist/) (ukadoc-spec/list/propertysystem/property-system/ghostlist.md)
- **検索語**: ghostlist
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「ghostlist」を確認。


## 実装箇所

- `src-tauri/src/shiori/property.rs:14` `if q == "ghostlist.count" {`
- `src-tauri/src/shiori/property.rs:17` `if q == "ghostlist.index(0).name" || q == "ghostlist.index(0)" {`
- `src-tauri/src/shiori/property.rs:52` `assert_eq!(evaluate_property_query("ghostlist.count"), "1");`
