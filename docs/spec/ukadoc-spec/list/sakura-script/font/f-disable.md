# \f[disable]

- **規格**: [f-disable.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/font/f-disable/) (ukadoc-spec/list/sakura-script/font/f-disable.md)
- **検索語**: \f
- **対応状況**: ❌ 検出なし

## 突合結果

実装コードに「\f」が見つからない(短いトークンのため誤検出の可能性大)。


## 実装箇所

- `crates/ui/src/lib.rs:112` `let script = r"\b[0]\b[-1]\t\-\_s\_l[10,20]\f[color,red]\f[bold]";`
- `crates/ui/src/script/command.rs:48` `}, // \f[tag,param], \f[tag]`
- `crates/ui/src/script/parser/brackets.rs:103` `/// `\f[tag,param]`または`\f[tag]``
- `crates/ui/src/script/parser/mod.rs:57` `// \f[tag,param] または \f[tag]`
- `ui/js/ghost/sakura-tokenizer.js:276` `// \f (フォント指定: \f[tag,param], \f[tag])`
