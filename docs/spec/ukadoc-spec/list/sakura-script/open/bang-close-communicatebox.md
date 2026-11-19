# \![close,communicatebox]

- **規格**: [bang-close-communicatebox.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/bang-close-communicatebox/) (ukadoc-spec/list/sakura-script/open/bang-close-communicatebox.md)
- **検索語**: Close
- **対応状況**: ✅ 実装済

## 突合結果

\\![close,...] コマンドのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/raiselike/execution.rs` -> `SakuraCommand::Close`)。
フロントエンド (`ui/ts/ghost/command-handler/communicatebox.ts`, `ui/ts/ui/renderers/modal-dialog-communication.ts`) においてコミュニケートボックスの削除処理 (`closeCommunicateBox`) および `OnCommunicateInputCancel` イベント送信を実装済。

## 実装箇所

- `crates/ui/src/script/command.rs:132` `Close {`
- `crates/ui/src/script/parser/brackets/handlers/raiselike/execution.rs:113` `callback(SakuraCommand::Close { service, target });`
- `crates/nanai-core/src/sakura_script/types.rs:35` `CloseCommunicatebox`
- `ui/ts/ghost/command-handler/communicatebox.ts:127` `export function closeCommunicateBox(`
- `ui/ts/ghost/command-handler/defaults/dialog-handlers.ts:86` `registerCommandHandler("close:communicatebox", ...)`
- `ui/ts/ui/renderers/modal-dialog-communication.ts:286` `export function closeCommunicateBox(`
