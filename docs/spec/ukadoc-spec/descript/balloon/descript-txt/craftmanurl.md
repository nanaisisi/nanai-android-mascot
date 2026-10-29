# craftmanurl,URL

- **規格**: [craftmanurl.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/craftmanurl.md)
- **検索語**: craftmanurl
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `src-tauri/src/commands/ext.rs:35` `let craftman_url = map.get("craftmanurl").cloned();`
- `src-tauri/src/commands/ext.rs:84` `let craftman_url = map.get("craftmanurl").cloned();`
- `src-tauri/src/commands/install/archive.rs:243` `.and_then(|m| m.get("craftmanurl").cloned());`
- `src-tauri/src/ghost/scan/directory.rs:89` `.and_then(|m| m.get("craftmanurl").cloned());`
- `crates/ui/src/descript.rs:135` `/// 作者Webページ (`craftmanurl` キー)`
