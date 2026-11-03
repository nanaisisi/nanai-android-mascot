# capability

- **規格**: [capability.md](https://ukatech.shillest.net/ukadoc-spec/list/shiori-event/notify/capability/) (ukadoc-spec/list/shiori-event/notify/capability.md)
- **検索語**: capability
- **対応状況**: ✅ 実装済

## 突合結果

実装コード内に「capability」を確認。


## 実装箇所

- `src-tauri/src/commands/shiori/protocol.rs:111` `/// `installedghostname`/`ghostpathlist`/`uniqueid`/`basewareversion`/`c`
- `src-tauri/src/commands/shiori/protocol.rs:125` `/// SHIORI へ UKADOC 準拠の capability Notify イベントを送信`
- `src-tauri/src/commands/shiori/protocol.rs:127` `pub async fn send_shiori_capability(`
- `src-tauri/src/commands/shiori/protocol.rs:131` `let refs = nanai_android_mascot_ui::build_standard_capability_references();`
- `src-tauri/src/commands/shiori/protocol.rs:132` `let mut req = ShioriRequest::capability(&refs);`
