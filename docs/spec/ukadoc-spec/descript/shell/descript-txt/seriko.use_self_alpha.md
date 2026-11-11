# seriko.use_self_alpha,値

- **規格**: [seriko.use_self_alpha.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell/descript-txt/seriko.use_self_alpha/) (ukadoc-spec/descript/shell/descript-txt/seriko.use_self_alpha.md)
- **検索語**: seriko.use_self_alpha
- **対応状況**: ⚠️ 一部対応

実装コード内に「seriko.use_self_alpha」は検出されませんでした。


## 実装箇所

- `crates/ui/src/descript/tests.rs:114` `let desc1 = Descript::parse("seriko.use_self_alpha,1\n");`
- `crates/ui/src/descript/tests.rs:117` `let desc2 = Descript::parse("seriko.use_self_alpha,true\n");`
- `crates/ui/src/descript/tests.rs:120` `let desc3 = Descript::parse("seriko.use_self_alpha,0\n");`
- `crates/ui/src/descript/parser/queries.rs:103` `/// `seriko.use_self_alpha,1`（アルファチャンネル透過の有効化）`
- `crates/ui/src/descript/parser/queries.rs:105` `self.get("seriko.use_self_alpha")`
