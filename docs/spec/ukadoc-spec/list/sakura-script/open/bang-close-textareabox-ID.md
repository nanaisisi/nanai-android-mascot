# \![close,textareabox,ID]

- **規格**: [bang-close-textareabox-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/bang-close-textareabox-ID/) (ukadoc-spec/list/sakura-script/open/bang-close-textareabox-ID.md)
- **検索語**: Close
- **対応状況**: ✅ 実装済

## 突合結果

\\![close,...] コマンドのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/raiselike/execution.rs` -> `SakuraCommand::Close`)。
フロントエンド (`ui/ts/ghost/command-handler/inputbox.ts`, `ui/ts/ui/renderers/inputs/text-inputs.ts`) において複数行テキストエリアボックスの削除処理 (`closeTextAreaBox`) を実装済。

## 実装箇所

- `crates/ui/src/script/command.rs:132` `Close {`
- `crates/ui/src/script/parser/brackets/handlers/raiselike/execution.rs:113` `callback(SakuraCommand::Close { service, target });`
- `crates/nanai-core/src/sakura_script/types.rs:29` `CloseTextarea`
- `ui/ts/ghost/command-handler/inputbox.ts:216` `export function closeTextAreaBox(`
- `ui/ts/ghost/command-handler/defaults/dialog-handlers.ts:71` `registerCommandHandler("close:textarea", ...)`
- `ui/ts/ui/renderers/inputs/text-inputs.ts:326` `export function closeTextAreaBox(`
