# %username

- **規格**: [pct-username.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/environment-variable/pct-username/) (ukadoc-spec/list/sakura-script/environment-variable/pct-username.md)
- **検索語**: username
- **対応状況**: ✅ 実装済

## 突合結果

実装コード内に「username」を確認。

## 実装箇所

- `src-tauri/src/shiori/property.rs:29` `"username" => "User".to_string(),`
- `src-tauri/src/shiori/property.rs:67` `assert_eq!(evaluate_property_query("username"), "User");`
- `crates/ui/src/script/env.rs:1` `//! SakuraScript Environment Variable Interpolation (%username, %selfname, %dms,`
- `crates/ui/src/script/env.rs:8` `username: &str,`
- `crates/ui/src/script/env.rs:26` `result = result.replace("%username", username);`
