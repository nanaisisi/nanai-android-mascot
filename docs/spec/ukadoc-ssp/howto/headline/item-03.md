# RSSを追加する

- **規格**: [headline.md](../../../../ukadoc-ssp/howto/headline.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/howto/headline/))
- **検索語**: fetch_headline_feed
- **対応状況**: ⚠️ 一部対応

## 突合結果

RSS/Atom フィード読み込みと HEADLINE 連携。


## 実装箇所

- `src-tauri/src/invoke.rs:108` `shiori::headline::fetch_headline_feed,`
- `src-tauri/src/shiori/headline.rs:109` `pub async fn fetch_headline_feed(url: String) -> Result<String, String> {`
