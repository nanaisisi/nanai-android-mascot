# craftman,作者名

- **規格**: [craftman.md](https://ukatech.shillest.net/ukadoc-spec/descript/headline/descript-txt/) (ukadoc-spec/descript/headline/descript-txt/craftman.md)
- **検索語**: craftman
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/commands/ext.rs` において `craftman` キーをパースし、`HeadlineInfo.craftman` へ設定する実装が行われている。

## 実装箇所

- `src-tauri/src/fmo.rs:22` `pub craftman: String,`
- `src-tauri/src/fmo.rs:50` `craftman: "Nanai Project".to_string(),`
- `src-tauri/src/commands/ext.rs:36` `// [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]:`
- `src-tauri/src/commands/ext.rs:37` `let craftman = map`
- `src-tauri/src/commands/ext.rs:38` `.get("craftman")`
