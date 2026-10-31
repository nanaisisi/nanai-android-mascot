# \-

- **規格**: [entry.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/event/entry/) (ukadoc-spec/list/sakura-script/event/entry.md)
- **検索語**: \-
- **対応状況**: ❌ 検出なし

## 突合結果

実装コードに「\-」が見つからない(短いトークンのため誤検出の可能性大)。

## 実装箇所

- `crates/ui/src/lib.rs:114` `let script = r"\b[0]\b[-1]\t\-\_s\_l[10,20]\f[color,red]\f[bold]";`
- `crates/ui/src/script/command.rs:39` `Halt,         // \- (ゴースト終了)`
- `crates/ui/src/script/parser/mod.rs:115` `let script = "\\0\\h\\1\\u\\p[2]\\px\\s[10]\\sx\\w5\\wx\\x\\_w[10]\\b[1]\\bx\\f[`
- `ui/coverage/prettify.js:56` `"(?:^^\\.?|[+-]|\\!|\\!=|\\!==|\\#|\\%|\\%=|&|&&|&&=|&=|\\(|\\*|\\*=|\\+=|\\,|\\`
- `ui/coverage/prettify.js:478` `"^(?:0x[a-f0-9]+|(?:\\d(?:_\\d+)*\\d*(?:\\.\\d*)?|\\.\\d\\+)(?:e[+\\-]?\\d+)?)[a`
