# \bID番号

- **規格**: [bID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/bID/) (ukadoc-spec/list/sakura-script/balloon-text/bID.md)
- **検索語**: \b
- **対応状況**: ✅ 実装済

## 突合結果

`\b0`～`\b9` などの数字直結型バルーン切替コマンドのパース処理および `SakuraCommand::Balloon(n)` へのマッピングを実装 (`crates/ui/src/script/parser/mod.rs`, `basic.rs`)。


## 実装箇所

- `src-tauri/src/commands/window/balloon_window/show.rs:101` `/// 独立バルーン（スコープ N）ウィンドウ非表示コマンド (\b[-1])`
- `crates/ui/src/lib.rs:114` `let script = r"\b[0]\b[-1]\t\-\_s\_l[10,20]\f[color,red]\f[bold]";`
- `crates/ui/src/script/command.rs:49` `Balloon(i32), // \b[n], \b[-1], \b0..\b9`
- `crates/ui/src/script/parser/mod.rs:57` `// \b[n] または \b0..\b9（\b[-1] 等の負数含む）`
- `crates/ui/src/script/parser/mod.rs:147` `let script = "\\0\\h\\1\\u\\p[2]\\px\\s[10]\\sx\\w5\\wx\\x\\_w[10]\\b[1]\\bx\\f[`
