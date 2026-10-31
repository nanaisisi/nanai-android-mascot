# 基本的な使い方：RSS/ヘッドライン

- **規格**: [howto/headline.md](https://ukatech.shillest.net/ukadoc-ssp/howto/headline/) (howto/headline.md)
- **対応状況**: ✅ 対応済

## 突合結果

RSS/Atom フィード読み込みと HEADLINE 連携 (`src-tauri/src/shiori/headline.rs` の `fetch_headline_feed`) の実装完了。

## 実装箇所

- `src-tauri/src/lib.rs:153` `commands::ext::scan_headlines,`
- `src-tauri/src/lib.rs:156` `shiori::headline::fetch_headline_feed,`
- `src-tauri/src/commands/ext.rs:73` `pub async fn scan_headlines(app_handle: tauri::AppHandle) -> Result<Vec<Headline`
- `src-tauri/src/commands/ext.rs:74` `let mut headlines = Vec::new();`
- `src-tauri/src/commands/ext.rs:78` `search_dirs.push(app_data_dir.join("userData").join("headline"));`
