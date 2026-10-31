# \n[half]

- **規格**: [n-half.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/n-half/) (ukadoc-spec/list/sakura-script/balloon-text/n-half.md)
- **検索語**: \n
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/ghost/sakura-parser.js / sakura-command-handler.js で処理: 改行 (\n[half] も対応)。

## 実装箇所

- `src-tauri/shiori-host/src/main.rs:150` `let resp = b"SHIORI/3.0 200 OK\r\n\r\n";`
- `src-tauri/shiori-host/src/main.rs:276` `let resp = b"SHIORI/3.0 200 OK\r\n\r\n";`
- `src-tauri/src/lib.rs:49` `.header("// deno-lint-ignore-file no-explicit-any\n// biome-ignore-all lint/susp`
- `src-tauri/src/sstp.rs:162` `let raw = "SEND SSTP/1.1\r\nSender: TestApp\r\nScript: \\0Hi\\e\r\nReference0: R`
- `src-tauri/src/commands/install/utils.rs:153` `let content = b"name,TestGhost\nversion,1.0.0\n// comment\n";`
