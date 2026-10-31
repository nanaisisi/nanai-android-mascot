# \![open,timeinput,ID,表示時間,時,分,秒,オプション]

- **規格**: [bang-open-timeinput-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/bang-open-timeinput-ID/) (ukadoc-spec/list/sakura-script/open/bang-open-timeinput-ID.md)
- **検索語**: OpenDialog
- **対応状況**: ✅ 実装済

## 突合結果

\\![open,...] コマンドのパース処理を実装 (crates/ui/src/script/parser/brackets/handlers/raiselike.rs -> SakuraCommand::OpenDialog)。

## 実装箇所

- `crates/ui/src/script/command.rs:87` `OpenDialog {`
- `crates/ui/src/script/parser/brackets/handlers/raiselike.rs:126` `callback(SakuraCommand::OpenDialog {`
- `crates/ui/src/script/parser/brackets/handlers/underscore.rs:128` `callback(SakuraCommand::OpenDialog {`
- `crates/ui/src/script/parser/brackets/handlers/underscore.rs:136` `callback(SakuraCommand::OpenDialog {`
- `ui/js/ghost/sakura-rust-bridge.js:235` `case "OpenDialog":`
