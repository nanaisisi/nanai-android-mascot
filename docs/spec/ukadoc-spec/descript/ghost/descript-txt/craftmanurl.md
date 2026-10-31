# craftmanurl,URL

- **規格**: [craftmanurl.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/descript-txt/) (ukadoc-spec/descript/ghost/descript-txt/craftmanurl.md)
- **検索語**: craftmanurl
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `craftmanurl` キーをパースし、`GhostInfo.craftman_url` へ設定する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/ext.rs:36` `// [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]:`
- `src-tauri/src/commands/ext.rs:42` `.get("craftmanurl")`
- `src-tauri/src/commands/ext.rs:101` `// [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]:`
- `src-tauri/src/commands/ext.rs:107` `.get("craftmanurl")`
- `src-tauri/src/commands/install/archive/postprocess.rs:58` `.and_then(|m| m.get("craftmanurl").cloned());`
