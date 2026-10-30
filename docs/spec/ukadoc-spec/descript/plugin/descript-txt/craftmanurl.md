# craftmanurl,URL

- **規格**: [craftmanurl.md](https://ukatech.shillest.net/ukadoc-spec/descript/plugin/descript-txt/) (ukadoc-spec/descript/plugin/descript-txt/craftmanurl.md)
- **検索語**: craftmanurl
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/ext.rs` において `craftmanurl` キーをパースし、`PluginInfo.craftman_url` へ設定する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/ext.rs:36` `// [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]:`
- `src-tauri/src/commands/ext.rs:38` `let craftman_url = map.get("craftmanurl").cloned().or_else(|| map.get("homeurl")`
- `src-tauri/src/commands/ext.rs:95` `// [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]:`
- `src-tauri/src/commands/ext.rs:97` `let craftman_url = map.get("craftmanurl").cloned().or_else(|| map.get("homeurl")`
- `src-tauri/src/commands/install/archive.rs:292` `.and_then(|m| m.get("craftmanurl").cloned());`
