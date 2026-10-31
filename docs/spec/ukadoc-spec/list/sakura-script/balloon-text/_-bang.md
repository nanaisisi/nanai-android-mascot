# \_!

- **規格**: [_-bang.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/-bang/)
- **検索語**: \_!
- **対応状況**: ✅ 実装済

## 突合結果

`\_!` (NoUserBreak) タグのパース処理を実装 (`crates/ui/src/script/parser/brackets/handlers/underscore.rs`)。


## 実装箇所

- `crates/ui/src/script/command.rs:50` `NoUserBreak(bool), // \_!`
- `crates/ui/src/script/parser/mod.rs:53` `// \_w / \_q / \_a / \_s / \_l / \_! / \_\_v / \_\_q`
