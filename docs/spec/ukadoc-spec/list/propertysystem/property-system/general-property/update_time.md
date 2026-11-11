# update_time

- **規格**: [update_time.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/general-property/update_time/)
- **検索語**: update_time
- **対応状況**: ⚠️ 一部対応

## 突合結果

実装コードに「update_time」が見つからない。


## 実装箇所

- `src-tauri/src/shiori/property/tests.rs:49` `assert_eq!(evaluate_property_query("update_time"), "0");`
- `src-tauri/src/shiori/property/evaluator/static_rules.rs:71` `"update_time" => "0",`
- `ui/ts/ghost/command-handler/env.ts:175` `case "update_time":`
