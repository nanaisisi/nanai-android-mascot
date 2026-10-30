# \j[ID]

- **規格**: [j-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/open/j-ID/) (ukadoc-spec/list/sakura-script/open/j-ID.md)
- **検索語**: \j
- **対応状況**: ❌ 検出なし

## 突合結果

実装コードに「\j」が見つからない(短いトークンのため誤検出の可能性大)。


## 実装箇所

- `crates/ui/src/lib.rs:197` `let script = r"\0\![open,inputbox,--timeout=5]\![set,str,hello]\j[1,2]\__w[500]あ`
- `crates/ui/src/lib.rs:213` `// 未知タグ（\j / \__w）の引数が本文に漏出していない`
