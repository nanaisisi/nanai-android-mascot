# craftman

- **規格**: [craftman.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-resource/shiori/craftman/) (ukadoc-spec/list/shiori-resource/shiori/craftman.md)
- **検索語**: craftman
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs で craftman / craftmanurl を読込。

## 実装箇所

- `src-tauri/src/fmo.rs:22` `pub craftman: String,`
- `src-tauri/src/fmo.rs:52` `craftman: "Nanai Project".to_string(),`
- `src-tauri/src/commands/ext.rs:36` `// [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]:`
- `src-tauri/src/commands/ext.rs:37` `let craftman = map.get("craftman").cloned().or_else(|| map.get("craftmanw").clon`
- `src-tauri/src/commands/ext.rs:38` `let craftman_url = map.get("craftmanurl").cloned().or_else(|| map.get("homeurl")`
