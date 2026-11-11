# \_a[ID,r2,r3...]

- **規格**: [_a-ID-r2-r3.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/_a-ID-r2-r3/) (ukadoc-spec/list/sakura-script/choice/_a-ID-r2-r3.md)
- **検索語**: \_a
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\_a[ID,r2,r3...]` 形式の拡張アンカータグのパース処理および `SakuraCommand::Anchor { id, text, args }` へのマッピングを実装 (`crates/ui/src/script/parser/brackets/handlers/underscore.rs`)。

## 実装箇所

- `crates/ui/src/script/command.rs:42` `}, // \_a[id,r2,...]text\_a`
- `crates/ui/src/script/ast/types/node.rs:17` `/// アンカー（\\_a[...]...\\_a）ブロック`
- `crates/ui/src/script/parser/executor.rs:56` `// \_w / \_q / \_a / \_s / \_l / \_! / \_\_v / \_\_q`
- `crates/ui/src/script/parser/tests.rs:82` `\\_a[id1,anchor text]\\_a\`
- `crates/ui/src/script/parser/brackets/mod.rs:148` `let mut chars = "a[anchor1]text\\_a".chars().peekable();`
