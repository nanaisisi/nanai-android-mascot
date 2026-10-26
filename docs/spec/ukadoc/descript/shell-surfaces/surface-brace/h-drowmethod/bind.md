# bind

- **規格**: [bind.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/bind/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/bind.md)
- **検索語**: bind
- **対応状況**: ❓ 要確認(surface 関連語)

## 突合結果

サーフェス処理 (ui/js/surface/) に関連する語「bind」が出現。surfaces.txt の該当機能として実装されているかは個別の読解が必要。

## 実装箇所

- `ui/js/surface/surface-animation-manager.js:100`  `intervalStr === "bind"`
- `crates/ui/src/script/parser.rs:130` (コメント) `// \![raise,Event,...] または \![bind,category,part,status]`
- `crates/ui/src/script/parser.rs:153`  `"bind" => {`
- `crates/ui/src/lib.rs:56`  `let script = r"\0\_q\x\_a[anchor01]リンク\_a\![raise,OnTest,1,2]\![bind,clothing,ribbon,1]";`
- `ui/js/surface/surface.js:193` (コメント) `* 着せ替えパーツの装着/解除 (\![bind,category,part,status] UKADOC準拠)`
