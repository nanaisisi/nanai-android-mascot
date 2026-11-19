# \![close,inputbox,ID]

- **規格**: [bang-close-inputbox-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/bang-close-inputbox-ID/) (ukadoc-spec/list/sakura-script/open/bang-close-inputbox-ID.md)
- **検索語**: Close
- **対応状況**: ✅ 実装済

## 突合結果

\\![close,...] コマンドのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/raiselike/execution.rs` -> `SakuraCommand::Close`)。
フロントエンド (`ui/ts/ghost/command-handler/inputbox.ts`, `ui/ts/ui/renderers/inputs/text-inputs.ts`) において単一行入力ボックスの削除処理 (`closeInputBox`) を実装済。

## 実装箇所

- `crates/ui/src/script/command.rs:132` `Close {`
- `crates/ui/src/script/parser/brackets/handlers/raiselike/execution.rs:113` `callback(SakuraCommand::Close { service, target });`
- `crates/nanai-core/src/sakura_script/types.rs:27` `CloseInputbox`
- `ui/ts/ghost/command-handler/inputbox.ts:192` `export function closeInputBox(`
- `ui/ts/ghost/command-handler/defaults/dialog-handlers.ts:67` `registerCommandHandler("close:inputbox", ...)`
- `ui/ts/ui/renderers/inputs/text-inputs.ts:159` `export function closeInputBox(`
