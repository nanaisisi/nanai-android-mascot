# \![close,dialog,ID]

- **規格**: [bang-close-dialog-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/bang-close-dialog-ID/) (ukadoc-spec/list/sakura-script/open/bang-close-dialog-ID.md)
- **検索語**: Close
- **対応状況**: ✅ 実装済

## 突合結果

\\![close,...] コマンドのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/raiselike/execution.rs` -> `SakuraCommand::Close`)。
フロントエンド (`ui/ts/ghost/command-handler/inputbox.ts`, `ui/ts/ui/renderers/modal-dialog-choices.ts`) において汎用ダイアログの削除処理 (`closeDialog`) を実装済。

## 実装箇所

- `crates/ui/src/script/command.rs:132` `Close {`
- `crates/ui/src/script/parser/brackets/handlers/raiselike/execution.rs:113` `callback(SakuraCommand::Close { service, target });`
- `crates/nanai-core/src/sakura_script/types.rs:31` `CloseDialog`
- `ui/ts/ghost/command-handler/inputbox.ts:230` `export function closeDialog(`
- `ui/ts/ghost/command-handler/defaults/dialog-handlers.ts:78` `registerCommandHandler("close:dialog", ...)`
- `ui/ts/ui/renderers/modal-dialog-choices.ts:14` `export function closeDialog(`
