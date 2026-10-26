# craftman,作者名

- **規格**: [craftman.md](https://ukatech.shillest.net/ukadoc-spec/descript/plugin/descript-txt/craftman/) (ukadoc-spec/descript/plugin/descript-txt/craftman.md)
- **検索語**: craftman
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `src-tauri/src/ghost/scan.rs:194` `let craftman = meta_map.as_ref().and_then(|m| m.get("craftman").cloned());`
- `src-tauri/src/ghost/scan.rs:195` `let craftman_url = meta_map`
- `src-tauri/src/ghost/scan.rs:197` `.and_then(|m| m.get("craftmanurl").cloned());`
- `src-tauri/src/ghost/scan.rs:208` `craftman,`
- `src-tauri/src/ghost/scan.rs:209` `craftman_url,`
