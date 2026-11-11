# %username

- **規格**: [pct-username.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-username/) (ukadoc-spec/list/sakura-script/environment-variable/pct-username.md)
- **検索語**: username
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コード内に「username」を確認。

## 実装箇所

- `src-tauri/src/shiori/property/tests.rs:15` `assert_eq!(evaluate_property_query("username"), "User");`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:29` `"username" => "User",`
- `crates/ui/src/script/env.rs:6` `username: &str,`
- `crates/ui/src/script/env.rs:17` `"username" => username,`
- `crates/ui/src/script/env.rs:31` `result = result.replace("%username", username);`
