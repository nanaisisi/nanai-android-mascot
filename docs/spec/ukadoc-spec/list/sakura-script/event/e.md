# \e

- **規格**: [e.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/event/e/) (ukadoc-spec/list/sakura-script/event/e.md)
- **検索語**: \e
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/ghost/sakura-parser.js / sakura-command-handler.js で処理: スクリプト終了。

## 実装箇所

- `src-tauri/src/sstp.rs:162` `let raw = "SEND SSTP/1.1\r\nSender: TestApp\r\nScript: \\0Hi\\e\r\nReference0: R`
- `src-tauri/src/sstp.rs:165` `assert_eq!(req.script, Some("\\0Hi\\e".to_string()));`
- `src-tauri/src/sstp.rs:177` `script: Some("\\0Hello\\e".to_string()),`
- `src-tauri/src/commands/ext.rs:167` `"\\0プラグイン「{}」が実行されました\\e",`
- `src-tauri/src/shiori/headline.rs:117` `script.push_str("\\e");`
