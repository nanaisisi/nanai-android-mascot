# \_q

- **規格**: [_q.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/wait/_q/) (ukadoc-spec/list/sakura-script/wait/_q.md)
- **検索語**: \_q
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/ghost/sakura-parser.js / sakura-command-handler.js で処理: クイック描画切替。


## 実装箇所

- `crates/ui/src/lib.rs:78` `let script = r"\0\_q\x\_a[anchor01]リンク\_a\![raise,OnTest,1,2]\![bind,clothing,ri`
- `crates/ui/src/lib.rs:142` `let script_q = r"\_q高速\_q[0]通常\_q[1]再度高速";`
- `crates/ui/src/script/command.rs:11` `Quick(bool),  // \_q (高速表示トグル)`
- `crates/ui/src/script/parser/mod.rs:49` `// \_w / \_q / \_a / \_s / \_l`
- `ui/js/ghost/sakura-tokenizer.js:141` `// \_q / \_q[1] / \_q[0] (クイック描画切替)`
