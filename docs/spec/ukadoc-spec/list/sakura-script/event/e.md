# \e

- **規格**: [e.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/event/e/) (ukadoc-spec/list/sakura-script/event/e.md)
- **検索語**: \e
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/ghost/sakura-parser.js / sakura-command-handler.js で処理: スクリプト終了。

## 実装箇所

- `crates/nanai-core/src/install_protocol.rs:236` `Some("\\0\\s0Installed!\\e"),`
- `src-tauri/src/commands/ext.rs:167` `"\\0プラグイン「{}」が実行されました\\e",`
- `ui/ts/ghost/shiori-worker.ts:40` `return "SHIORI/3.0 200 OK\r\nCharset: UTF-8\r\nValue: \\0\\s[0]WASM SHIORI respo`
- `ui/ts/ui/spec-compliance-runner.ts:649` `return { status: 200, value: "\\0HeadClicked\\e" };`
- `tests/balloon-events.test.ts:20` `await mockContext.sendBalloonCloseNotify("\\0Hello\\e", 0);`
- `crates/nanai-core/src/install_protocol.rs:244` `"\\0\\s0Installed!\\e"`
