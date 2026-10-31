# \![close,teachbox]

- **規格**: [bang-close-teachbox.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/bang-close-teachbox/) (ukadoc-spec/list/sakura-script/open/bang-close-teachbox.md)
- **検索語**: Close
- **対応状況**: ✅ 実装済

## 突合結果

\\![close,...] コマンドのパース処理を実装 (crates/ui/src/script/parser/brackets/handlers/raiselike.rs -> SakuraCommand::Close)。

## 実装箇所

- `src-tauri/src/shiori/ffi/builder.rs:84` `.event("OnClose")`
- `crates/ui/src/script/command.rs:112` `Close {`
- `crates/ui/src/script/parser/brackets/handlers/raiselike.rs:221` `callback(SakuraCommand::Close { service, target });`
- `crates/ui/src/shiori/protocol/request.rs:185` `let notify_req = ShioriRequest::notify("OnClose", &[]);`
- `crates/ui/src/shiori/protocol/request.rs:187` `assert_eq!(notify_req.id, "OnClose");`
