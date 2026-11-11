# system.monitor.index(ID).primary

- **規格**: [system.monitor.index-ID-.primary.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/system.monitor.index-ID-.primary/) (ukadoc-spec/list/propertysystem/property-system/system.monitor.index-ID-.primary.md)
- **検索語**: system.monitor.index
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コードに「system.monitor.index」が見つからない。


## 実装箇所

- `src-tauri/src/shiori/property/tests.rs:42` `evaluate_property_query("system.monitor.index(0).rect"),`
- `src-tauri/src/shiori/property/evaluator/dynamic_rules.rs:29` `if q.starts_with("system.monitor.index") {`
- `ui/ts/ghost/command-handler/env.ts:186` `if (key.startsWith("system.monitor.index")) return "0,0,1920,1080";`
