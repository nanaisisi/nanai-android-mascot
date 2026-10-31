# \_a[ID,r2,r3...]

- **規格**: [_a-ID-r2-r3.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/_a-ID-r2-r3/) (ukadoc-spec/list/sakura-script/choice/_a-ID-r2-r3.md)
- **検索語**: \_a
- **対応状況**: ⚠️ 一部対応

## 突合結果

基本形 (ID/テキスト) のみ処理し、この拡張形式 (複数ID / OnID / script: / 追加参照) は未対応。

## 実装箇所

- `crates/ui/src/lib.rs:81` `let script = r"\0\_q\x\_a[anchor01]リンク\_a\![raise,OnTest,1,2]\![bind,clothing,ri`
- `crates/ui/src/script/command.rs:23` `}, // \_a[id]text\_a`
- `crates/ui/src/script/parser/mod.rs:49` `// \_w / \_q / \_a / \_s / \_l`
- `crates/ui/src/script/parser/brackets/mod.rs:104` `let mut chars = "a[anchor1]text\\_a".chars().peekable();`
- `crates/ui/src/script/parser/brackets/mod.rs:182` `"a[id]text\\_b\\_a",`
