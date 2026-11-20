# \z

- **規格**: [z.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/choice/z/) (ukadoc-spec/list/sakura-script/choice/z.md)
- **検索語**: \z
- **対応状況**: ⚠️ 一部対応

## 突合結果

`\z` タグのパース処理および `SakuraCommand::Z` へのマッピングを実装 (`crates/ui/src/script/parser/mod.rs`)。

## 実装箇所

- `crates/ui/src/script/command.rs:44` `Z,            // \z`
- `crates/ui/src/script/parser/executor.rs:116` `Some('z') => callback(SakuraCommand::Z),    // \z`
- `crates/ui/src/script/parser/tests.rs:29` `let script = "\\0\\h\\1\\u\\p[2]\\px\\s[10]\\sx\\w5\\wx\\x\\_w[10]\\b[1]\\bx\\f[`
