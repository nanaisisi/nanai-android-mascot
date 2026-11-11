# \![execute,http-put-URL]

- **規格**: [bang-execute-http-put-URL.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/misc/bang-execute-http-put-URL/) (ukadoc-spec/list/sakura-script/misc/bang-execute-http-put-URL.md)
- **検索語**: Command
- **対応状況**: ⚠️ 一部対応

## 突合結果

\![execute,...] (HTTP PUT実行) コマンドのパース処理を実装 (crates/ui/src/script/parser/brackets/handlers/raiselike.rs)。

## 実装箇所

- `src-tauri/build.rs:24` `let status = std::process::Command::new(std::env::var("CARGO").unwrap_or("cargo"`
- `src-tauri/shiori-host/src/main.rs:228` `let status = std::process::Command::new("rustc")`
- `src-tauri/src/shiori/dynamic/host.rs:64` `use std::process::{Command, Stdio};`
- `src-tauri/src/shiori/dynamic/host.rs:68` `let mut child = Command::new(exe)`
- `crates/ui/src/script/command.rs:169` `Command {`
