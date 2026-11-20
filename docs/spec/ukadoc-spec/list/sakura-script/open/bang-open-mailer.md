# \![open,mailer,パラメータ]

- **規格**: [bang-open-mailer.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/bang-open-mailer/) (ukadoc-spec/list/sakura-script/open/bang-open-mailer.md)
- **検索語**: OpenDialog
- **対応状況**: ⚠️ 一部対応

## 突合結果

\\![open,...] コマンドのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/raiselike/settings/handlers.rs` -> `SakuraCommand::OpenDialog`)。
OS 外部メーラー連携ハンドラは今後拡張予定（現状 `SakuraCommand::OpenDialog` パースまで対応）。

## 実装箇所

- `crates/ui/src/script/command.rs:101` `OpenDialog {`
- `crates/ui/src/script/parser/brackets/handlers/raiselike/settings/handlers.rs:36` `callback(SakuraCommand::OpenDialog {`
- `crates/ui/src/script/parser/brackets/handlers/underscore/handlers.rs:154` `callback(SakuraCommand::OpenDialog {`
- `crates/ui/src/script/parser/brackets/handlers/underscore/handlers.rs:162` `callback(SakuraCommand::OpenDialog {`
- `crates/ui/src/tests/sakura_script.rs:169` `SakuraCommand::OpenDialog {`
