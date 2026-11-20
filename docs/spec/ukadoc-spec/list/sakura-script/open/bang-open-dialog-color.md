# \![open,dialog,color,パラメータ]

- **規格**: [bang-open-dialog-color.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/bang-open-dialog-color/) (ukadoc-spec/list/sakura-script/open/bang-open-dialog-color.md)
- **検索語**: OpenDialog
- **対応状況**: ⚠️ 一部対応

## 突合結果

\\![open,...] コマンドのパース処理を実装 (crates/ui/src/script/parser/brackets/handlers/raiselike.rs -> SakuraCommand::OpenDialog)。

## 実装箇所

- `crates/ui/src/script/command.rs:101` `OpenDialog {`
- `crates/ui/src/script/parser/brackets/handlers/raiselike/settings/handlers.rs:36` `callback(SakuraCommand::OpenDialog {`
- `crates/ui/src/script/parser/brackets/handlers/underscore/handlers.rs:154` `callback(SakuraCommand::OpenDialog {`
- `crates/ui/src/script/parser/brackets/handlers/underscore/handlers.rs:162` `callback(SakuraCommand::OpenDialog {`
- `crates/ui/src/tests/sakura_script.rs:169` `SakuraCommand::OpenDialog {`
