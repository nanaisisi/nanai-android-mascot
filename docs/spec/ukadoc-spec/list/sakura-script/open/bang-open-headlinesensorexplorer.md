# \![open,headlinesensorexplorer]

- **規格**: [bang-open-headlinesensorexplorer.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/bang-open-headlinesensorexplorer/) (ukadoc-spec/list/sakura-script/open/bang-open-headlinesensorexplorer.md)
- **検索語**: OpenDialog
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\![open,headlinesensorexplorer]` コマンドのパース (`crates/ui/src/script/parser/brackets/handlers/raiselike.rs`) およびヘッドラインエクスプローラモーダル表示ハンドリング (`ui/ts/ghost/command-handler/system/target.ts`) が完全実装済み。

## 実装箇所

- `crates/ui/src/script/command.rs:101` `OpenDialog {`
- `crates/ui/src/script/parser/brackets/handlers/raiselike/settings/handlers.rs:36` `callback(SakuraCommand::OpenDialog {`
- `crates/ui/src/script/parser/brackets/handlers/underscore/handlers.rs:154` `callback(SakuraCommand::OpenDialog {`
- `crates/ui/src/script/parser/brackets/handlers/underscore/handlers.rs:162` `callback(SakuraCommand::OpenDialog {`
- `crates/ui/src/tests/sakura_script.rs:169` `SakuraCommand::OpenDialog {`
