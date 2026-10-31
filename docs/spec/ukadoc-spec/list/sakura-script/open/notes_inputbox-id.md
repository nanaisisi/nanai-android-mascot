# InputBoxのID

- **規格**: [notes_inputbox-id.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/notes_inputbox-id/) (ukadoc-spec/list/sakura-script/open/notes_inputbox-id.md)
- **検索語**: InputBox
- **対応状況**: ⚠️ 一部対応

## 突合結果

openInputBox で入力ボックスを開く処理はあるが、ID/オプション指定の解釈は未確認。

## 実装箇所

- `ui/js/ghost/sakura-command-handler.js:4` `import { openInputBox } from "./command-handler/inputbox.js";`
- `ui/js/ghost/sakura-command-handler.js:26` `openInputBox(this, args.slice(2));`
- `ui/js/ghost/sakura-command-handler.js:119` `openInputBox(params) {`
- `ui/js/ghost/sakura-command-handler.js:120` `openInputBox(this, params);`
- `ui/js/ghost/command-handler/inputbox.js:1` `export function openInputBox(handler, params) {`
