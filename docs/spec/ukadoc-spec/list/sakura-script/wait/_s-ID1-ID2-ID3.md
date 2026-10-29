# \_s[ID1,ID2,ID3...]

- **規格**: [_s-ID1-ID2-ID3.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/wait/_s-ID1-ID2-ID3/) (ukadoc-spec/list/sakura-script/wait/_s-ID1-ID2-ID3.md)
- **検索語**: \_s
- **対応状況**: ❌ 検出なし

## 突合結果

実装コードに「\_s」が見つからない(短いトークンのため誤検出の可能性大)。


## 実装箇所

- `crates/ui/src/lib.rs:112` `let script = r"\b[0]\b[-1]\t\-\_s\_l[10,20]\f[color,red]\f[bold]";`
- `crates/ui/src/lib.rs:153` `let script_ps = r"\p[2]\p3\_s[1]同期\_s[0]非同期";`
- `crates/ui/src/script/command.rs:40` `Sync(bool),   // \_s (複数キャラ同期発話トグル)`
- `crates/ui/src/script/parser/brackets.rs:167` `/// `\_` 系コマンド（\_w / \_q / \_a / \_s / \_l）の共通処理`
- `crates/ui/src/script/parser/brackets.rs:212` `// \_s (複数キャラ同期表示トグル / \_s[1], \_s[0])`
