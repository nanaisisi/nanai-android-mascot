# \__w[animation,ID]

- **規格**: [__w-animation-ID.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/surface/__w-animation-ID/) (ukadoc-spec/list/sakura-script/surface/__w-animation-ID.md)
- **検索語**: \__w
- **対応状況**: ❌ 検出なし

## 突合結果

実装コード内に「\__w」を確認。


## 実装箇所

- `crates/ui/src/lib.rs:198` `let script = r"\0\![open,inputbox,--timeout=5]\![set,str,hello]\j[1,2]\__w[500]あ`
- `crates/ui/src/lib.rs:214` `// 未知タグ（\j / \__w）の引数が本文に漏出していない`
- `crates/ui/src/script/parser/brackets.rs:232` `// \__w[delay] 等の副コマンド連結: 1文字読み飛ばして [...] を消費`
