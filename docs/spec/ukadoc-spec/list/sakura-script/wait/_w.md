# \_w[時間]

- **規格**: [_w.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/wait/_w/) (ukadoc-spec/list/sakura-script/wait/_w.md)
- **検索語**: \_w
- **対応状況**: ✅ 実装済

## 突合結果

ui/js/ghost/sakura-parser.js / sakura-command-handler.js で処理: ミリ秒ウェイト。

## 実装箇所

- `crates/ui/src/script/command.rs:9` `Wait(u32),    // \w1..9, \_w[ms] (ミリ秒単位)`
- `crates/ui/src/script/parser/mod.rs:53` `// \_w / \_q / \_a / \_s / \_l / \_! / \_\_v / \_\_q`
- `crates/ui/src/script/parser/mod.rs:131` `let script = "\\0\\h\\1\\u\\p[2]\\px\\s[10]\\sx\\w5\\wx\\x\\_w[10]\\b[1]\\bx\\f[`
- `crates/ui/src/script/parser/brackets/mod.rs:1` `//! さくらスクリプトの括弧コマンド（`\s[N]` / `\_w[N]` / `\![...]` 等）処理モジュール`
- `ui/js/ghost/sakura-tokenizer.js:109` `// \_w[ms] (ミリ秒ウェイト)`
