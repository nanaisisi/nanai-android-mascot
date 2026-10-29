# \_q

- **規格**: [_q.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/wait/_q/) (ukadoc-spec/list/sakura-script/wait/_q.md)
- **検索語**: \_q
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/ghost/sakura-parser.js / sakura-command-handler.js で処理: クイック描画切替。


## 実装箇所

- `crates/ui/src/lib.rs:79` `let script = r"\0\_q\x\_a[anchor01]リンク\_a\![raise,OnTest,1,2]\![bind,clothing,ri`
- `crates/ui/src/lib.rs:143` `let script_q = r"\_q高速\_q[0]通常\_q[1]再度高速";`
- `crates/ui/src/script/command.rs:11` `Quick(bool),  // \_q (高速表示トグル)`
- `crates/ui/src/script/parser/brackets.rs:167` `/// `\_` 系コマンド（\_w / \_q / \_a / \_s / \_l）の共通処理`
- `crates/ui/src/script/parser/brackets.rs:180` `// \_q / \_q[1] (高速表示ON), \_q[0] (高速表示OFF)`
