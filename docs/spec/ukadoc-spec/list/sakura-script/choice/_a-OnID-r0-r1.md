# \_a[OnID,r0,r1...]

- **規格**: [_a-OnID-r0-r1.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/_a-OnID-r0-r1/) (ukadoc-spec/list/sakura-script/choice/_a-OnID-r0-r1.md)
- **検索語**: \_a
- **対応状況**: ⚠️ 一部対応

## 突合結果

基本形 (ID/テキスト) のみ処理し、この拡張形式 (複数ID / OnID / script: / 追加参照) は未対応。


## 実装箇所

- `crates/ui/src/lib.rs:79` `let script = r"\0\_q\x\_a[anchor01]リンク\_a\![raise,OnTest,1,2]\![bind,clothing,ri`
- `crates/ui/src/script/command.rs:23` `}, // \_a[id]text\_a`
- `crates/ui/src/script/parser/brackets.rs:167` `/// `\_` 系コマンド（\_w / \_q / \_a / \_s / \_l）の共通処理`
- `crates/ui/src/script/parser/brackets.rs:191` `// \_a[id]text\_a`
- `crates/ui/src/script/parser/brackets.rs:193` `// \_a までテキストを蓄積`
