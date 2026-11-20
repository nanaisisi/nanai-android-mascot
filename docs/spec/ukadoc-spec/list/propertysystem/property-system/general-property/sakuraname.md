# sakuraname

- **規格**: [sakuraname.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/sakuraname/)
- **検索語**: sakuraname
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コード内に「sakuraname」を確認。

## 実装箇所

- `src-tauri/src/shiori/property/evaluator/mod.rs:46` `"sakuraname" | "sakura.name" => return g.sakura_name().unwrap_or("").to_string()`
- `src-tauri/src/shiori/property/evaluator/mod.rs:109` `"sakuraname" | "sakura.name" => g.sakura_name().unwrap_or("").to_string(),`
- `src-tauri/src/shiori/property/evaluator/mod.rs:150` `| "sakuraname"`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:33` `"sakuraname" | "sakura.name" => "",`
