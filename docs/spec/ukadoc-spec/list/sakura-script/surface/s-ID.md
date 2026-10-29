# \s[ID番号]

- **規格**: [s-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/surface/s-ID/) (ukadoc-spec/list/sakura-script/surface/s-ID.md)
- **検索語**: \s
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/ghost/sakura-parser.js / sakura-command-handler.js で処理: サーフェス切替。


## 実装箇所

- `src-tauri/src/commands/window/character_window.rs:81` `/// キャラクター（スコープ N）ウィンドウ非表示コマンド (\s[-1])`
- `crates/ui/src/update.rs:74` `ghost\\master\\shiori.dll\x01FEDCBA09876543210987654321ABCDEF\r\n";`
- `crates/ui/src/lib.rs:58` `let script = r"\0\s[0]こんにちは\w5\n\q[はい,id_yes]\e";`
- `crates/ui/src/lib.rs:166` `let script = r"\h\s[0]ひと\h\u\s[10]うなぎ\n[half]\0下半分";`
- `crates/ui/src/script/command.rs:8` `Surface(u32), // \s[0], \s0`
