# filename,dll

- **規格**: [filename.md](https://ukatech.shillest.net/ukadoc-spec/descript/plugin/descript-txt/filename/) (ukadoc-spec/descript/plugin/descript-txt/filename.md)
- **検索語**: filename
- **対応状況**: 🔎 コード上に出現(処理の有無は要読解)

## 突合結果

実装コードに「filename」が出現。実際の処理内容は未精査。

## 実装箇所

- `src-tauri/src/ghost/scan.rs:104`  `let bg_bmp = map.get("menu.background.bitmap.filename").cloned();`
- `src-tauri/src/ghost/scan.rs:105`  `let fg_bmp = map.get("menu.foreground.bitmap.filename").cloned();`
- `src-tauri/src/ghost/scan.rs:106`  `let side_bmp = map.get("menu.sidebar.bitmap.filename").cloned();`
- `crates/ui/src/app.rs:30`  `pub fn extract_filename(path: &str) -> String {`
