# InputBoxのID

- **規格**: [notes_inputbox-id.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/notes_inputbox-id/) (ukadoc-spec/list/sakura-script/open/notes_inputbox-id.md)
- **検索語**: InputBox
- **対応状況**: ⚠️ 一部対応

## 突合結果

openInputBox で入力ボックスを開く処理はあるが、ID/オプション指定の解釈は未確認。

## 実装箇所

- `ui/js/ghost/sakura-command-handler.js:21` `this.openInputBox(args.slice(2));`
- `ui/js/ghost/sakura-command-handler.js:116` `openInputBox(params) {`
