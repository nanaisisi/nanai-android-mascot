# \x

- **規格**: [x.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/wait/x/) (ukadoc-spec/list/sakura-script/wait/x.md)
- **検索語**: \x
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/ghost/sakura-parser.js / sakura-command-handler.js で処理: クリック待ち・改ページ。


## 実装箇所

- `crates/ui/src/update.rs:26` `// 区切り文字: \x01 (Byte 1) または カンマフォールバック`
- `crates/ui/src/update.rs:27` `let parts: Vec<&str> = if data_part.contains('\x01') {`
- `crates/ui/src/update.rs:28` `data_part.split('\x01').collect()`
- `crates/ui/src/update.rs:73` `let content = "ghost\\master\\descript.txt\x011A2B3C4D5E6F7890ABCDEF1234567890\x`
- `crates/ui/src/update.rs:74` `ghost\\master\\shiori.dll\x01FEDCBA09876543210987654321ABCDEF\r\n";`
