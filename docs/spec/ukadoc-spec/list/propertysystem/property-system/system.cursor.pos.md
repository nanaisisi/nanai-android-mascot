# system.cursor.pos

- **規格**: [system.cursor.pos.md](https://ukatech.shillest.net/ukadoc-spec/list/propertysystem/property-system/system.cursor.pos/) (ukadoc-spec/list/propertysystem/property-system/system.cursor.pos.md)
- **検索語**: system.cursor.pos
- **対応状況**: ✅ 実装済

## 突合結果

実装コードに「system.cursor.pos」が見つからない。


## 実装箇所

- `src-tauri/src/shiori/property.rs:78` `"system.cursor.pos" => "0,0".to_string(),`
- `src-tauri/src/shiori/property.rs:146` `assert_eq!(evaluate_property_query("system.cursor.pos"), "0,0");`
- `ui/js/ghost/command-handler/env.js:120` `case "system.cursor.pos":`
