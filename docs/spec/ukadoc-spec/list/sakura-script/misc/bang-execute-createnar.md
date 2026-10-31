# \![execute,createnar,出力先ファイル]

- **規格**: [bang-execute-createnar.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/misc/bang-execute-createnar/) (ukadoc-spec/list/sakura-script/misc/bang-execute-createnar.md)
- **検索語**: ArchiveExec
- **対応状況**: ✅ 実装済

## 突合結果

`\![execute,createnar,...]` コマンドのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/raiselike.rs` -> `SakuraCommand::ArchiveExec`)。

## 実装箇所

- `crates/ui/src/script/command.rs:116` `ArchiveExec {`
- `crates/ui/src/script/parser/brackets/handlers/raiselike.rs:38` `callback(SakuraCommand::ArchiveExec { action, filename, dest });`
- `ui/js/ghost/sakura-rust-bridge.js:160` `case "ArchiveExec":`
