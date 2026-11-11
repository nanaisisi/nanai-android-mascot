# \*

- **規格**: [star.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/star/) (ukadoc-spec/list/sakura-script/choice/star.md)
- **検索語**: \*
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\*` (Star) タグのパース処理および `SakuraCommand::Star` へのマッピングを実装 (`crates/ui/src/script/parser/mod.rs`)。

## 実装箇所

- `crates/ui/src/script/command.rs:43` `Star,         // \*`
- `crates/ui/src/script/env.rs:59` `// %* (%\*) 環境変数展開 [pct-star.md]`
- `crates/ui/src/script/parser/executor.rs:113` `Some('*') => callback(SakuraCommand::Star), // \*`
- `crates/ui/src/script/parser/tests.rs:66` `\\*\\![change,ghost,sakura]\\![call,ghost,kero]\`
- `ui/ts/surface/parser/scope-blocks.ts:19` `/^(sakura|kero|char\d+|\*)?\.?cursor\s*\{?$/i,`
