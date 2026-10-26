# menu.background.bitmap.filename,ファイル名

- **規格**: [menu.background.bitmap.filename.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/menu.background.bitmap.filename/) (ukadoc-spec/descript/shell/descript-txt/menu.background.bitmap.filename.md)
- **検索語**: menu.background.bitmap.filename
- **対応状況**: ⚠️ 一部対応(読込のみ)

## 突合結果

ghost/scan.rs 等で descript の値を読込している。表示・動作への反映は個別未確認。

## 実装箇所

- `src-tauri/src/ghost/scan.rs:104` `let bg_bmp = map.get("menu.background.bitmap.filename").cloned();`
