# menu.sidebar.bitmap.filename,ファイル名

- **規格**: [menu.sidebar.bitmap.filename.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/menu.sidebar.bitmap.filename/) (ukadoc-spec/descript/shell/descript-txt/menu.sidebar.bitmap.filename.md)
- **検索語**: menu.sidebar.bitmap.filename
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `src-tauri/src/ghost/scan/shell.rs:149` `// [menu.background.bitmap.filename,ファイル名], [menu.foreground.bitmap.filename,ファイ`
- `src-tauri/src/ghost/scan/shell.rs:161` `.get("menu.sidebar.bitmap.filename")`
