# \![execute,http-get-URL-3]

- **規格**: [bang-execute-http-get-URL-3.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/misc/bang-execute-http-get-URL-3/) (ukadoc-spec/list/sakura-script/misc/bang-execute-http-get-URL-3.md)
- **検索語**: DownloadExec
- **対応状況**: ✅ 実装済

## 突合結果

\![execute,...] (HTTP GET実行) コマンドのパース処理を実装 (crates/ui/src/script/parser/brackets/handlers/raiselike.rs)。

## 実装箇所

- `crates/ui/src/script/command.rs:121` `DownloadExec {`
- `crates/ui/src/script/parser/brackets/handlers/raiselike.rs:42` `callback(SakuraCommand::DownloadExec { url, save_path });`
- `ui/js/ghost/sakura-rust-bridge.js:167` `case "DownloadExec":`
