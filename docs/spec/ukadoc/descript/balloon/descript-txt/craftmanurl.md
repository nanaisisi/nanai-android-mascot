# craftmanurl,URL

- **規格**: [craftmanurl.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/descript-txt/craftmanurl/) (ukadoc-spec/descript/balloon/descript-txt/craftmanurl.md)
- **検索語**: craftmanurl
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `src-tauri/src/ghost/scan.rs:197` `.and_then(|m| m.get("craftmanurl").cloned());`
- `src-tauri/src/commands/install.rs:168` `.and_then(|m| m.get("craftmanurl").cloned());`
