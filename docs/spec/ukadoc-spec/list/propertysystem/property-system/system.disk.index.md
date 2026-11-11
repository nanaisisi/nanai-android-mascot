# system.disk.index(ID).(キー)

- **規格**: [system.disk.index.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/system.disk.index/) (ukadoc-spec/list/propertysystem/property-system/system.disk.index.md)
- **検索語**: system.disk.index
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コードに「system.disk.index」が見つからない。


## 実装箇所

- `src-tauri/src/shiori/property/tests.rs:46` `evaluate_property_query("system.disk.index(0).free"),`
- `src-tauri/src/shiori/property/evaluator/dynamic_rules.rs:32` `if q.starts_with("system.disk.index") {`
- `ui/ts/ghost/command-handler/env.ts:187` `if (key.startsWith("system.disk.index")) return "100000";`
