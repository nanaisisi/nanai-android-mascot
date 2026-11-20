# ブラウザの設定

- **規格**: [extprog.md](../../../../ukadoc-ssp/config/extprog.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/extprog/))
- **検索語**: extprog, browser
- **対応状況**: ✅ 実装済

## 突合結果

外部ブラウザの指定設定は未実装。


## 実装箇所

- `ui/ts/ghost/command-handler/system/target.ts:112` `case "browser": {`
- `tests/command-handler-boost.test.ts:135` `"browser",`
- `tests/command-handler-system/target.test.ts:56` `it("handleOpenSystemTarget handles explorer, browser, and modal dialogs", async `
- `tests/command-handler-system/target.test.ts:86` `"browser",`
- `tests/sakura-command-handler/basic-commands.test.ts:64` `await handler.runCommand(["open", "browser", "https://example.com"]);`
