# \![open,dialog,color,パラメータ]

- **規格**: [bang-open-dialog-color.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/bang-open-dialog-color/) (ukadoc-spec/list/sakura-script/open/bang-open-dialog-color.md)
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
