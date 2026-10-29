# \t

- **規格**: [t.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/wait/t/) (ukadoc-spec/list/sakura-script/wait/t.md)
- **検索語**: \t
- **対応状況**: ❌ 検出なし

## 突合結果

実装コードに「\t」が見つからない(短いトークンのため誤検出の可能性大)。


## 実装箇所

- `crates/ui/src/update.rs:107` `let content = "\r\n  \r\n\t\r\n";`
- `crates/ui/src/lib.rs:112` `let script = r"\b[0]\b[-1]\t\-\_s\_l[10,20]\f[color,red]\f[bold]";`
- `crates/ui/src/script/command.rs:38` `Timeout,      // \t (タイムアウト抑止)`
- `ui/js/ghost/sakura-tokenizer.js:293` `// \t (タイムアウト抑止)`
- `ui/js/ghost/sakura-script.js:25` `* `\t` タイムクリティカルセクション (UKADOC準拠)。`
