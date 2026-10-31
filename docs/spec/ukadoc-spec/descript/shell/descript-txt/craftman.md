# craftman,作者名

- **規格**: [craftman.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/craftman/) (ukadoc-spec/descript/shell/descript-txt/craftman.md)
- **検索語**: craftman
- **対応状況**: ✅ 実装済

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `src-tauri/src/fmo.rs:22` `pub craftman: String,`
- `src-tauri/src/fmo.rs:50` `craftman: "Nanai Project".to_string(),`
- `src-tauri/src/commands/ext.rs:36` `// [craftman,作者名], [craftmanw,作者名], [craftmanurl,URL], [homeurl,URL]:`
- `src-tauri/src/commands/ext.rs:37` `let craftman = map`
- `src-tauri/src/commands/ext.rs:38` `.get("craftman")`
