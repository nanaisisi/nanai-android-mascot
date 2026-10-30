# \__w[時間]

- **規格**: [__w.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/wait/__w/) (ukadoc-spec/list/sakura-script/wait/__w.md)
- **検索語**: \__w
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「\__w」を確認。


## 実装箇所

- `crates/ui/src/lib.rs:200` `let script = r"\0\![open,inputbox,--timeout=5]\![set,str,hello]\j[1,2]\__w[500]あ`
- `crates/ui/src/lib.rs:216` `// 未知タグ（\j / \__w）の引数が本文に漏出していない`
