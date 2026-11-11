# 基本的な使い方：RSS/ヘッドライン

- **規格**: [howto/headline.md](https://ukatech.shillest.net/ukadoc-ssp/howto/headline/) (howto/headline.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

RSS/Atom フィード読み込みと HEADLINE 連携 (`src-tauri/src/shiori/headline.rs` の `fetch_headline_feed`) の実装完了。

## 実装箇所

- `src-tauri/src/lib.rs:185` `shiori::headline::fetch_headline_feed,`
- `src-tauri/src/commands/ext.rs:78` `search_dirs.push(app_data_dir.join("userData").join("headline"));`
- `src-tauri/src/commands/ext.rs:79` `search_dirs.push(app_data_dir.join("headline"));`
- `src-tauri/src/commands/ext.rs:82` `search_dirs.push(current_dir.join("assets").join("headline"));`
- `src-tauri/src/commands/install/archive/inspection/analyzer/resource_resolver.rs:11` `"headline",`
