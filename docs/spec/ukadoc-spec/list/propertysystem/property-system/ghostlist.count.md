# ghostlist.count

- **規格**: [ghostlist.count.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/ghostlist.count/) (ukadoc-spec/list/propertysystem/property-system/ghostlist.count.md)
- **検索語**: ghostlist.count
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コード内に「ghostlist.count」を確認。

## 実装箇所

- `src-tauri/src/shiori/property/tests.rs:9` `assert_eq!(evaluate_property_query("ghostlist.count"), "1");`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:5` `"ghostlist.count" => "1",`
- `src-tauri/src/sstp/handler/request_processor.rs:96` `properties.insert("ghostlist.count".to_string(), "1".to_string());`
- `crates/ui/src/sstp/tests/execution/command_context/execute_commands/mod.rs:12` `properties.insert("ghostlist.count".to_string(), "2".to_string());`
- `crates/ui/src/sstp/tests/execution/command_context/execute_commands/property_cookie.rs:11` `let res_prop = handle_execute_command("GetProperty[ghostlist.count]", &ctx);`
