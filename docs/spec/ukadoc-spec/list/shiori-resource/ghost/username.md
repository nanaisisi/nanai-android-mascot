# username

- **規格**: [username.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/ghost/username/) (ukadoc-spec/list/shiori-resource/ghost/username.md)
- **検索語**: username
- **対応状況**: ⚠️ 一部対応

## 突合結果

username SHIORIリソース・プロパティ評価処理を実装 (src-tauri/src/shiori/property.rs -> evaluate_property_query)。

## 実装箇所

- `src-tauri/src/shiori/property/tests.rs:15` `assert_eq!(evaluate_property_query("username"), "User");`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:29` `"username" => "User",`
- `crates/ui/src/script/env.rs:6` `username: &str,`
- `crates/ui/src/script/env.rs:17` `"username" => username,`
- `crates/ui/src/script/env.rs:31` `result = result.replace("%username", username);`
