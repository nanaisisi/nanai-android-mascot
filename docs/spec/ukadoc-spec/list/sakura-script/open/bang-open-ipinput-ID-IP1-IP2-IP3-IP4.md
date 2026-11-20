# \![open,ipinput,ID,表示時間,IP1桁目,IP2桁目,IP3桁目,IP4桁目,オプション]

- **規格**: [bang-open-ipinput-ID-IP1-IP2-IP3-IP4.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/bang-open-ipinput-ID-IP1-IP2-IP3-IP4/) (ukadoc-spec/list/sakura-script/open/bang-open-ipinput-ID-IP1-IP2-IP3-IP4.md)
- **検索語**: OpenDialog
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\![open,ipinput,...]` コマンドのパース (`crates/ui/src/script/parser/brackets/handlers/raiselike.rs`), コマンドディスパッチ (`ui/ts/ghost/command-handler/inputbox.ts` -> `openIpInput`), および 4 桁 IP アドレス入力 4 フィールドコントロール (`ui/ts/ui/renderers/inputs/advanced/ip-input.ts`) が完全実装済み。

## 実装箇所

- `crates/ui/src/script/command.rs:101` `OpenDialog {`
- `crates/ui/src/script/parser/brackets/handlers/raiselike/settings/handlers.rs:36` `callback(SakuraCommand::OpenDialog {`
- `crates/ui/src/script/parser/brackets/handlers/underscore/handlers.rs:154` `callback(SakuraCommand::OpenDialog {`
- `crates/ui/src/script/parser/brackets/handlers/underscore/handlers.rs:162` `callback(SakuraCommand::OpenDialog {`
- `crates/ui/src/tests/sakura_script.rs:169` `SakuraCommand::OpenDialog {`
