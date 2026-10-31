# username

- **規格**: [username.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/username/)
- **検索語**: username
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「username」を確認。

## 実装箇所

- `src-tauri/src/shiori/property.rs:29` `"username" => "User".to_string(),`
- `src-tauri/src/shiori/property.rs:60` `assert_eq!(evaluate_property_query("username"), "User");`
