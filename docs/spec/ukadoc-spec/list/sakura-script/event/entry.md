# \-

- **規格**: [entry.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/event/entry/) (ukadoc-spec/list/sakura-script/event/entry.md)
- **検索語**: \-
- **対応状況**: ❌ 検出なし

## 突合結果

実装コードに「\-」が見つからない(短いトークンのため誤検出の可能性大)。


## 実装箇所

- `crates/ui/src/lib.rs:112` `let script = r"\b[0]\b[-1]\t\-\_s\_l[10,20]\f[color,red]\f[bold]";`
- `crates/ui/src/script/command.rs:39` `Halt,         // \- (ゴースト終了)`
- `ui/js/ghost/sakura-tokenizer.js:298` `// \- (ゴースト終了)`
- `cpp/yaya-shiori/parser0.cpp:2528` `CRegexpT<yaya::char_t> regex(L"^[^!\"#$%&'()*+,\\-/:;<=>?@\\[\\\\\\]`{|}\\s]+\\(`
- `cpp/yaya-shiori/parser0.cpp:2532` `CRegexpT<yaya::char_t> regex2(L"([^!\"#$%&'()*+\\-/:;<=>?@\\[\\\\\\]`{|}\\s]+)",`
