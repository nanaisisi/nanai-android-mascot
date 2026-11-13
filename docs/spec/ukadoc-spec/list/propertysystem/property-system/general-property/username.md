# username

- **規格**: [username.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/username/)
- **検索語**: username
- **対応状況**: ✅ 実装済

## 突合結果

実装コード内に「username」を確認。

## 実装箇所

- `crates/nanai-core/src/sakura_script.rs:251` `pub username: String,`
- `src-tauri/src/shiori/property/tests.rs:15` `assert_eq!(evaluate_property_query("username"), "User");`
- `ui/ts/ghost/ghost.ts:86` `declare username?: string;`
- `tests/ghost-coverage-boost/command-handler.test.ts:37` `username: "Alice",`
- `crates/nanai-core/src/sakura_script.rs:265` `username: "User".to_string(),`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:29` `"username" => "User",`
