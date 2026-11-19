# \![close,teachbox]

- **規格**: [bang-close-teachbox.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/bang-close-teachbox/) (ukadoc-spec/list/sakura-script/open/bang-close-teachbox.md)
- **検索語**: Close
- **対応状況**: ✅ 実装済

## 突合結果

\\![close,...] コマンドのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/raiselike/execution.rs` -> `SakuraCommand::Close`)。
フロントエンド (`ui/ts/ghost/command-handler/teachbox.ts`, `ui/ts/ui/renderers/modal-dialog-communication.ts`) においてティーチボックスの削除処理 (`closeTeachBox`) を実装済。

## 実装箇所

- `crates/ui/src/script/command.rs:132` `Close {`
- `crates/ui/src/script/parser/brackets/handlers/raiselike/execution.rs:113` `callback(SakuraCommand::Close { service, target });`
- `crates/nanai-core/src/sakura_script/types.rs:33` `CloseTeachbox`
- `ui/ts/ghost/command-handler/teachbox.ts:101` `export function closeTeachBox(`
- `ui/ts/ghost/command-handler/defaults/dialog-handlers.ts:82` `registerCommandHandler("close:teachbox", ...)`
