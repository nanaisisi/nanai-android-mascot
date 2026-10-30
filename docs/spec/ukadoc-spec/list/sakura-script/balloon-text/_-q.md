# \_?

- **規格**: [_-q.md](https://ukatech.shillest.net/ukadoc-spec/list/sakura-script/balloon-text/_-q/) (ukadoc-spec/list/sakura-script/balloon-text/_-q.md)
- **検索語**: \_
- **対応状況**: ❌ 未実装

## 突合結果

パーサがタグを読み飛ばす、または sakura-command-handler.js が「未対応の \! コマンド」として扱い、該当処理はない。


## 実装箇所

- `crates/ui/src/lib.rs:78` `let script = r"\0\_q\x\_a[anchor01]リンク\_a\![raise,OnTest,1,2]\![bind,clothing,ri`
- `crates/ui/src/lib.rs:111` `let script = r"\b[0]\b[-1]\t\-\_s\_l[10,20]\f[color,red]\f[bold]";`
- `crates/ui/src/lib.rs:142` `let script_q = r"\_q高速\_q[0]通常\_q[1]再度高速";`
- `crates/ui/src/lib.rs:152` `let script_ps = r"\p[2]\p3\_s[1]同期\_s[0]非同期";`
- `crates/ui/src/lib.rs:197` `let script = r"\0\![open,inputbox,--timeout=5]\![set,str,hello]\j[1,2]\__w[500]あ`
