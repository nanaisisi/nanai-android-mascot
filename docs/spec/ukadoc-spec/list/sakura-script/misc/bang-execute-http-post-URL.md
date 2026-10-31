# \![execute,http-post-URL]

- **規格**: [bang-execute-http-post-URL.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/misc/bang-execute-http-post-URL/) (ukadoc-spec/list/sakura-script/misc/bang-execute-http-post-URL.md)
- **検索語**: UploadExec
- **対応状況**: ✅ 実装済

## 突合結果

\![execute,...] (HTTP POST実行) コマンドのパース処理を実装 (crates/ui/src/script/parser/brackets/handlers/raiselike.rs)。

## 実装箇所

- `crates/ui/src/script/command.rs:124` `UploadExec {`
- `crates/ui/src/script/parser/brackets/handlers/raiselike.rs:46` `callback(SakuraCommand::UploadExec { url, file_path });`
- `ui/js/ghost/sakura-rust-bridge.js:174` `case "UploadExec":`
