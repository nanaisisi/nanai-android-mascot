# 基本的な使い方：RSS/ヘッドライン

- **規格**: [howto/headline.md](https://ukatech.shillest.net/ukadoc-ssp/howto/headline/) (howto/headline.md)
- **対応状況**: ✅ 実装済

## 突合結果

RSS/Atom フィード読み込みと HEADLINE 連携 (`src-tauri/src/shiori/headline.rs` の `fetch_headline_feed`) の実装完了。

## 実装箇所

- `crates/nanai-core/src/install_protocol.rs:10` `"headline",`
- `src-tauri/src/lib.rs:205` `shiori::headline::fetch_headline_feed,`
- `ui/ts/core/actions/install-protocol.ts:24` `"headline",`
- `ui/ts/ui/context-menu-keyboard.ts:9` `h: "headline", // RSS/ヘッドライン (Headline)`
- `tests/shiori-extended-events.test.ts:6` `import "./shiori-extended-events/headline-rss.test.js";`
- `crates/nanai-core/src/update_protocol.rs:10` `pub const UPDATE_TARGET_TYPES: &[&str] = &["ghost", "shell", "balloon", "plugin"`
