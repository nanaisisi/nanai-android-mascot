# \![cancel,http,URL]

- **規格**: [bang-cancel-http-URL.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/misc/bang-cancel-http-URL/) (ukadoc-spec/list/sakura-script/misc/bang-cancel-http-URL.md)
- **検索語**: Cancel
- **対応状況**: ✅ 実装済

## 突合結果

`\![cancel,...]` コマンドのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/raiselike.rs` -> `SakuraCommand::Cancel`)。

## 実装箇所

- `src-tauri/src/commands/shell/ghost.rs:29` `.buttons(MessageDialogButtons::OkCancel)`
- `crates/ui/src/script/command.rs:108` `Cancel {`
- `crates/ui/src/script/parser/brackets/handlers/raiselike.rs:216` `callback(SakuraCommand::Cancel { service, target });`
- `ui/js/ghost/sakura-rust-bridge.js:146` `case "Cancel":`
- `ui/js/ghost/shiori-notify.js:25` `* - OnConfigurationDialogHelp, OnGhostTermsAccept, OnGhostTermsDecline, OnSystem`
