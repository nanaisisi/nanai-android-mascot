# filename,dll

- **規格**: [filename.md](https://ukatech.shillest.net/ukadoc-spec/descript/plugin/descript-txt/filename/) (ukadoc-spec/descript/plugin/descript-txt/filename.md)
- **検索語**: filename
- **対応状況**: ❌ 未実装(誤検出)

## 突合結果

ヒットしたのは一般的な語「filename」の無関係な出現。該当の仕様に対応する処理は確認できない。

## 実装箇所

- `src-tauri/src/ghost/scan.rs:104`  `let bg_bmp = map.get("menu.background.bitmap.filename").cloned();`
- `src-tauri/src/ghost/scan.rs:105`  `let fg_bmp = map.get("menu.foreground.bitmap.filename").cloned();`
- `src-tauri/src/ghost/scan.rs:106`  `let side_bmp = map.get("menu.sidebar.bitmap.filename").cloned();`
- `crates/ui/src/app.rs:30`  `pub fn extract_filename(path: &str) -> String {`
