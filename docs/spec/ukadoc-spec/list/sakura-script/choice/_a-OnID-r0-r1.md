# \_a[OnID,r0,r1...]

- **規格**: [_a-OnID-r0-r1.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/_a-OnID-r0-r1/) (ukadoc-spec/list/sakura-script/choice/_a-OnID-r0-r1.md)
- **検索語**: \_a
- **対応状況**: ✅ 実装済

## 突合結果

`\_a[OnID,r0,r1...]` 形式のアンカータグのパース処理および `SakuraCommand::Anchor` へのマッピングを実装 (`crates/ui/src/script/parser/brackets/handlers/underscore.rs`)。

## 実装箇所

- `crates/ui/src/lib.rs:81` `let script = r"\0\_q\x\_a[anchor01]リンク\_a\![raise,OnTest,1,2]\![bind,clothing,ri`
- `crates/ui/src/script/command.rs:35` `}, // \_a[id,r2,...]text\_a`
- `crates/ui/src/script/parser/mod.rs:52` `// \_w / \_q / \_a / \_s / \_l / \_! / \_\_v / \_\_q`
- `crates/ui/src/script/parser/brackets/mod.rs:104` `let mut chars = "a[anchor1]text\\_a".chars().peekable();`
- `crates/ui/src/script/parser/brackets/mod.rs:182` `"a[id]text\\_b\\_a",`
