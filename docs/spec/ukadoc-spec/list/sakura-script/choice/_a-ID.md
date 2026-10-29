# \_a[ID]

- **規格**: [_a-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/_a-ID/) (ukadoc-spec/list/sakura-script/choice/_a-ID.md)
- **検索語**: \_a
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/ghost/sakura-parser.js / sakura-command-handler.js で処理: アンカー (begin/end)。


## 実装箇所

- `crates/ui/src/lib.rs:79` `let script = r"\0\_q\x\_a[anchor01]リンク\_a\![raise,OnTest,1,2]\![bind,clothing,ri`
- `crates/ui/src/script/command.rs:23` `}, // \_a[id]text\_a`
- `crates/ui/src/script/parser/brackets.rs:167` `/// `\_` 系コマンド（\_w / \_q / \_a / \_s / \_l）の共通処理`
- `crates/ui/src/script/parser/brackets.rs:191` `// \_a[id]text\_a`
- `crates/ui/src/script/parser/brackets.rs:193` `// \_a までテキストを蓄積`
