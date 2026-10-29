# craftman,作者名

- **規格**: [craftman.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/craftman.md)
- **検索語**: craftman
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `src-tauri/src/fmo.rs:22` `pub craftman: String,`
- `src-tauri/src/fmo.rs:52` `craftman: "Nanai Project".to_string(),`
- `src-tauri/src/commands/ext.rs:34` `let craftman = map.get("craftman").cloned();`
- `src-tauri/src/commands/ext.rs:35` `let craftman_url = map.get("craftmanurl").cloned();`
- `src-tauri/src/commands/ext.rs:42` `craftman,`
