# \_s

- **規格**: [_s.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/wait/_s/) (ukadoc-spec/list/sakura-script/wait/_s.md)
- **検索語**: \_s
- **対応状況**: ❌ 検出なし

## 突合結果

実装コードに「\_s」が見つからない(短いトークンのため誤検出の可能性大)。


## 実装箇所

- `crates/ui/src/lib.rs:114` `let script = r"\b[0]\b[-1]\t\-\_s\_l[10,20]\f[color,red]\f[bold]";`
- `crates/ui/src/lib.rs:155` `let script_ps = r"\p[2]\p3\_s[1]同期\_s[0]非同期";`
- `crates/ui/src/script/command.rs:40` `Sync(bool),   // \_s (複数キャラ同期発話トグル)`
- `crates/ui/src/script/parser/mod.rs:49` `// \_w / \_q / \_a / \_s / \_l`
- `ui/js/ghost/sakura-tokenizer.js:230` `// \_s (複数キャラ同期表示トグル / \_s[1], \_s[0])`
