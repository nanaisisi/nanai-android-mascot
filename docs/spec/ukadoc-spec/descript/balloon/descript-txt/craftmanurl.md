# craftmanurl,URL

- **規格**: [craftmanurl.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/craftmanurl.md)
- **検索語**: craftmanurl
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `src-tauri/src/commands/ext.rs:36` `// [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]:`
- `src-tauri/src/commands/ext.rs:38` `let craftman_url = map.get("craftmanurl").cloned().or_else(|| map.get("homeurl")`
- `src-tauri/src/commands/ext.rs:95` `// [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]:`
- `src-tauri/src/commands/ext.rs:97` `let craftman_url = map.get("craftmanurl").cloned().or_else(|| map.get("homeurl")`
- `src-tauri/src/commands/install/archive.rs:287` `.and_then(|m| m.get("craftmanurl").cloned());`
