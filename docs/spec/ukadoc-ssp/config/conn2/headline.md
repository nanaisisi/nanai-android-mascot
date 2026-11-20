# ヘッドライン

- **規格**: [conn2.md](../../../../ukadoc-ssp/config/conn2.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/conn2/))
- **検索語**: headline, rss
- **対応状況**: ✅ 実装済

## 突合結果

ヘッドライン/RSS の自動チェック周期・更新通知設定は未実装。


## 実装箇所

- `crates/nanai-core/src/install_protocol/types.rs:59` `"headline",`
- `src-tauri/src/invoke.rs:108` `shiori::headline::fetch_headline_feed,`
- `ui/ts/core/actions/install-protocol.ts:23` `"headline",`
- `ui/ts/ui/context-menu-keyboard.ts:9` `h: "headline", // RSS/ヘッドライン (Headline)`
- `tests/shiori-extended-events.test.ts:6` `import "./shiori-extended-events/headline-rss.test.js";`
- `crates/nanai-core/src/update_protocol/types.rs:8` `pub const UPDATE_TARGET_TYPES: &[&str] = &["ghost", "shell", "balloon", "plugin"`
