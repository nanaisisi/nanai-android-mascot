# system.os.(キー)

- **規格**: [system.os.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/system.os/) (ukadoc-spec/list/propertysystem/property-system/system.os.md)
- **検索語**: system.os.
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「system.os.」が見つからない。


## 実装箇所

- `src-tauri/src/shiori/property.rs:88` `if q.starts_with("system.os.") {`
- `src-tauri/src/shiori/property.rs:152` `assert_eq!(evaluate_property_query("system.os.name"), "Linux");`
- `ui/js/ghost/command-handler/env.js:136` `if (key.startsWith("system.os.")) return "Linux";`
